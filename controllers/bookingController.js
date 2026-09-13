const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Create Booking with Double-Booking Prevention & Capacity Guard
exports.createBooking = async (req, res) => {
  try {
    const { room, title, organizer, attendeesCount, startTime, endTime } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    // Smart Check 1: Capacity Limit Guard
    const roomDetails = await Room.findById(room);
    if (!roomDetails || !roomDetails.isActive) {
      return res.status(404).json({ success: false, error: 'Selected room is unavailable' });
    }
    if (attendeesCount > roomDetails.capacity) {
      return res.status(400).json({ 
        success: false, 
        error: `Room capacity (${roomDetails.capacity}) exceeded by attendees count (${attendeesCount})` 
      });
    }

    // Smart Check 2: Strict Overlap Conflict Guard
    const conflict = await Booking.findOne({
      room,
      status: 'confirmed',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    });

    if (conflict) {
      return res.status(409).json({ 
        success: false, 
        error: 'Time slot conflict: Room is already booked during this period' 
      });
    }

    const booking = await Booking.create({
      room,
      title,
      organizer,
      attendeesCount,
      startTime: start,
      endTime: end
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' }).populate('room', 'name location capacity');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Cancel Booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};