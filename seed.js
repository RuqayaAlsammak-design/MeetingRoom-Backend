const mongoose = require('mongoose');
const Room = require('./models/Room'); // Adjust to your Room model file name if different
require('dotenv').config();

const rooms = [
  { name: 'Meeting room A', floor: 'Floor 5', capacity: 10 },
  { name: 'Meeting room B', floor: 'Floor 6', capacity: 12 },
  { name: 'Meeting room C', floor: 'Floor 8', capacity: 15 },
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    
    // Clear existing rooms and insert the 3 new rooms
    await Room.deleteMany({});
    await Room.insertMany(rooms);
    
    console.log('Successfully seeded rooms: Meeting room A, B, and C!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();