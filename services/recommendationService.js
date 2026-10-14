const axios = require('axios');
const Booking = require('../models/Booking');

/**
 * Find smart time slot recommendations based on Microsoft Graph calendar availability
 * and room usage trends.
 */
const getSmartRecommendations = async (userAccessToken, { attendees, date, durationMinutes = 30, roomId }) => {
  try {
    // 1. Fetch participant free/busy slots via Graph API
    const findTimesPayload = {
      attendees: attendees.map((email) => ({
        emailAddress: { address: email },
        type: 'required',
      })),
      timeConstraint: {
        activityDomain: 'work',
        timeSlots: [
          {
            start: { dateTime: `${date}T08:00:00`, timeZone: 'Arabian Standard Time' },
            end: { dateTime: `${date}T16:00:00`, timeZone: 'Arabian Standard Time' },
          },
        ],
      },
      meetingDuration: `PT${durationMinutes}M`,
      maxCandidates: 5,
    };

    const graphRes = await axios.post(
      'https://graph.microsoft.com/v1.0/me/findMeetingTimes',
      findTimesPayload,
      {
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const meetingCandidates = graphRes.data.meetingTimeSuggestions || [];

    // 2. Fetch existing local bookings for the selected room & date
    const localBookings = await Booking.find({ room: roomId, date });

    // 3. Filter candidates against room availability & score them
    const recommendations = meetingCandidates
      .map((candidate) => {
        const start = candidate.meetingTimeSlot.start.dateTime.split('T')[1].substring(0, 5);
        const end = candidate.meetingTimeSlot.end.dateTime.split('T')[1].substring(0, 5);

        // Check if room is available locally
        const isRoomBusy = localBookings.some(
          (b) => (start >= b.startTime && start < b.endTime) || (end > b.startTime && end <= b.endTime)
        );

        if (isRoomBusy) return null;

        // Score slot (e.g., morning slots 09:00 - 11:30 scored higher)
        const hour = parseInt(start.split(':')[0], 10);
        let score = 'Optimal';
        if (hour >= 11 && hour <= 13) score = 'Peak Usage Hour';
        if (hour >= 14) score = 'Good';

        return {
          startTime: start,
          endTime: end,
          confidence: candidate.confidence,
          recommendationTag: score,
        };
      })
      .filter(Boolean);

    return recommendations;
  } catch (error) {
    console.error('Smart Recommendation Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = { getSmartRecommendations };