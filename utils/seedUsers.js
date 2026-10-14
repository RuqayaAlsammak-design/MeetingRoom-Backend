const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User'); // Adjust path as needed
const connectDB = require('./config/db');

dotenv.config();

const seedUsers = async () => {
  try {
    // 1. Connect to Database
    if (connectDB && typeof connectDB === 'function') {
      await connectDB();
    } else {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // 2. Clear existing user with target email
    await User.deleteOne({ email: 'ralsammak@silah.com' });
    console.log('Cleared existing test user if present');

    // 3. Create test user (Pass plain text password so the User schema pre('save') hook hashes it)
    const user = await User.create({
      name: 'Ruqaya',
      email: 'ralsammak@silah.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('✅ Test user created successfully:');
    console.log({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding user: ${error.message}`);
    process.exit(1);
  }
};

seedUsers();