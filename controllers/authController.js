const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userService = require('../services/userService');
const { generateToken } = require('../utils/tokenUtils');

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('--- Login Attempt ---');
    console.log('Received email:', email);
    console.log('Received password:', password);

    if (!email || !password) {
      console.log('Result: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Check for user in MongoDB (with case-insensitive and trimmed lookup)
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log('Result: User not found in database');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check password match via bcrypt method
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Result: Password mismatch');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Return user data and token
    console.log('Result: Login successful for', user.email);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Protect routes middleware
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-__v');

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};