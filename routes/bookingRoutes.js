// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  deleteBooking
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.route('/:id')
  .get(protect, getBookingById)
  .delete(protect, deleteBooking);

module.exports = router;