// seedRooms.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('./models/Room'); // Adjust path as needed
const connectDB = require('./config/db');

dotenv.config();

const rooms = [
  {
    name: '5th Floor Meeting Room',
    email: '5th_Meeting_Room@silah.bh',
    capacity: 8,
    floor: 5,
    facilities: ['TV Display', 'Whiteboard', 'Video Conferencing']
  },
  {
    name: '6th Floor Meeting Room',
    email: '6th_Meeting_Room@silah.bh',
    capacity: 12,
    floor: 6,
    facilities: ['Projector', 'Whiteboard', 'Conference Phone']
  },
  {
    name: '8th Floor Meeting Room',
    email: '8th_Meeting_Room@silah.bh',
    capacity: 16,
    floor: 8,
    facilities: ['Executive Boardroom Setup', 'Dual Screens', 'Video Conferencing']
  }
];

const seedRooms = async () => {
  try {
    if (connectDB && typeof connectDB === 'function') {
      await connectDB();
    } else {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Upsert room records using email as unique identifier
    for (const roomData of rooms) {
      await Room.findOneAndUpdate(
        { email: roomData.email },
        roomData,
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log('✅ Meeting rooms seeded successfully:');
    console.log(rooms.map(r => `${r.name} (${r.email})`).join('\n'));

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding rooms: ${error.message}`);
    process.exit(1);
  }
};

seedRooms();