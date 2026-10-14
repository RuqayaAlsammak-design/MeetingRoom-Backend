// controllers/bookingController.js
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;

// @desc    Create new room booking and send calendar invite
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { roomId, title, startTime, endTime } = req.body;

    // 1. Fetch Room details to get official email
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Meeting room not found' });
    }

    // 2. Save booking in MongoDB
    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      title,
      startTime,
      endTime
    });

    // 3. Build iCalendar payload for Exchange / Outlook resource processing
    const calendar = ical({ name: 'Silah Meeting Room Booking' });
    calendar.createEvent({
      start: new Date(startTime),
      end: new Date(endTime),
      summary: title,
      location: room.name,
      organizer: { name: req.user.name, email: req.user.email },
      attendees: [
        { name: room.name, email: room.email, rsvp: true }
      ]
    });

    // 4. Send Email to Exchange Resource Mailbox
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: room.email,
      subject: `Booking Request: ${title}`,
      text: `Meeting booking for ${room.name} from ${startTime} to ${endTime}`,
      icalEvent: {
        filename: 'booking.ics',
        method: 'REQUEST',
        content: calendar.toString()
      }
    });

    res.status(201).json({
      success: true,
      message: `Booking created and notification sent to ${room.email}`,
      booking
    });

  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'name email capacity floor')
      .populate('user', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room', 'name email capacity floor')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all controller actions required by bookingRoutes.js
module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking
};