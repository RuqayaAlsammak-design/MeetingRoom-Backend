const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Create Booking (with Overlap Prevention & Capacity Guard)
router.post('/', async (req, res) => {
  try {
    const { room, title, organizer, attendeesCount, startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    // Capacity Guard
    const targetRoom = await Room.findById(room);
    if (!targetRoom || !targetRoom.isActive) {
      return res.status(404).json({ success: false, error: 'Selected room is invalid or inactive' });
    }
    if (attendeesCount > targetRoom.capacity) {
      return res.status(400).json({ 
        success: false, 
        error: `Attendees (${attendeesCount}) exceed room capacity (${targetRoom.capacity})` 
      });
    }

    // Overlap Prevention Guard
    const conflict = await Booking.findOne({
      room,
      status: 'confirmed',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    });

    if (conflict) {
      return res.status(409).json({ success: false, error: 'Time slot conflict: Room already booked' });
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
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get All Bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'confirmed' }).populate('room', 'name location capacity');
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cancel Booking
router.put('/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;