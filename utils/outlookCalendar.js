import axios from 'axios';

/**
 * Exchange authorization code for Microsoft OAuth access tokens
 */
export const getMicrosoftTokens = async (authCode) => {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID,
    client_secret: process.env.AZURE_CLIENT_SECRET,
    code: authCode,
    redirect_uri: process.env.REDIRECT_URI,
    grant_type: 'authorization_code',
  });

  const response = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return response.data; // Returns access_token, refresh_token, etc.
};

/**
 * Automatically create an event in the user's Microsoft Outlook Calendar
 */
export const createOutlookCalendarEvent = async (accessToken, booking) => {
  const { roomName, date, timeSlot, details } = booking;
  const [startTimeStr, endTimeStr] = timeSlot.split(' - ');

  // Format ISO strings (YYYY-MM-DDTHH:mm:ss)
  const startDateTime = `${date}T${startTimeStr.trim()}:00`;
  const endDateTime = `${date}T${endTimeStr.trim()}:00`;

  const eventPayload = {
    subject: `Silah Booking: ${roomName}`,
    body: {
      contentType: 'HTML',
      content: details || `Room reservation for ${roomName} booked via Silah.`,
    },
    start: {
      dateTime: startDateTime,
      timeZone: 'Arabian Standard Time',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Arabian Standard Time',
    },
    location: {
      displayName: roomName,
    },
  };

  const response = await axios.post(
    'https://graph.microsoft.com/v1.0/me/events',
    eventPayload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};