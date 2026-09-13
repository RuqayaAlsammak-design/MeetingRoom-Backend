const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Create Room
router.post('/', async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Get All Active Rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// SMART FEATURE: Recommendation Engine (Find available room with best capacity fit)
router.post('/recommend', async (req, res) => {
  try {
    const { attendees, startTime, endTime, requiredAmenities } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Find rooms booked in this timeframe
    const unavailableRoomIds = await Booking.find({
      status: 'confirmed',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    }).distinct('room');

    const query = {
      _id: { $nin: unavailableRoomIds },
      isActive: true,
      capacity: { $gte: attendees }
    };

    if (requiredAmenities?.length) {
      query.amenities = { $all: requiredAmenities };
    }

    // Returns available rooms sorted by capacity (smallest fit first to optimize space)
    const recommendations = await Room.find(query).sort({ capacity: 1 });
    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Room
router.put('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Soft Delete Room
router.delete('/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
