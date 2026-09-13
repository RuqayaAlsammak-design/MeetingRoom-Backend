const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  title: { type: String, required: true },
  organizer: { type: String, required: true },
  attendeesCount: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['confirmed', 'cancelled'], 
    default: 'confirmed' 
  }
}, { timestamps: true });

// Prevent index conflicts by building index on query pattern
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);