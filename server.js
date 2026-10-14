require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

// 1. Database Connection
connectDB();

// 2. Security & Cross-Origin Resource Sharing (CORS) Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Violation: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-ms-access-token']
}));

// 3. Content Security Policy Headers (for Azure / Microsoft Graph integration)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' http://localhost:5000 http://localhost:5173 http://localhost:3000; " +
    "connect-src 'self' http://localhost:5000 http://127.0.0.1:5000 ws://localhost:5000 ws://127.0.0.1:5000 http://localhost:5173 http://127.0.0.1:5173 http://localhost:3000 https://login.microsoftonline.com https://graph.microsoft.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:;"
  );
  next();
});

// 4. Request Body Parsing (MUST be registered before API routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Health Check / Root Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Meeting Room Booking API' });
});

// 6. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Fallback compatibility mounts
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

// 7. Global 404 Handler for Unmatched Routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// 8. Error Handling Middleware
app.use(errorHandler);

// 9. Server Initialization
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});