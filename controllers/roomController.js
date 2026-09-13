const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Create Room
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get All Rooms
exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete (Soft Delete) Room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SMART FEATURE 1: Smart Room Recommendation Engine
exports.recommendRoom = async (req, res) => {
  try {
    const { attendees, startTime, endTime, requiredAmenities } = req.body;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // 1. Find overlapping bookings during requested time slot
    const overlappingBookings = await Booking.find({
      status: 'confirmed',
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    }).distinct('room');

    // 2. Query filter for available rooms matching criteria
    const query = {
      _id: { $nin: overlappingBookings },
      isActive: true,
      capacity: { $gte: attendees }
    };

    if (requiredAmenities && requiredAmenities.length > 0) {
      query.amenities = { $all: requiredAmenities };
    }

    // 3. Sort by optimal capacity to minimize wasted space
    const recommendations = await Room.find(query).sort({ capacity: 1 });

    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};