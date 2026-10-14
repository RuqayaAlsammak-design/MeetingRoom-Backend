const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USERNAME || process.env.SENDER_EMAIL;
const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD || process.env.SENDER_PASSWORD;

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });
} else {
  console.warn('⚠️ Warning: Email credentials not found in .env. SMTP email notifications will be skipped.');
}

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  if (!transporter) return;

  const { title, startTime, endTime, roomName } = bookingDetails;

  const mailOptions = {
    from: `"Meeting Room Booking" <${EMAIL_USER}>`,
    to: userEmail,
    subject: `Meeting Room Booking Confirmed: ${title}`,
    html: `
      <h2>Your booking is confirmed</h2>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Room:</strong> ${roomName}</p>
      <p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
      <p><strong>End Time:</strong> ${new Date(endTime).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent to:', userEmail);
  } catch (err) {
    console.error('Failed to send confirmation email:', err.message);
  }
};

const sendCancellationNotification = async (bookingDetails, userEmail) => {
  if (!transporter) return;

  const { title, startTime, roomName } = bookingDetails;

  const mailOptions = {
    from: `"Meeting Room Booking" <${EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Cancelled: ${title}`,
    html: `
      <h2>Your booking has been cancelled</h2>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Room:</strong> ${roomName}</p>
      <p><strong>Original Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Cancellation email sent to:', userEmail);
  } catch (err) {
    console.error('Failed to send cancellation email:', err.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification
};