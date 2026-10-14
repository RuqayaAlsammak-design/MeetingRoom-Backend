// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Room email address is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required']
  },
  floor: {
    type: Number
  },
  facilities: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);