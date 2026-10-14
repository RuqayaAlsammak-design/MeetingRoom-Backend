require('dotenv').config();
const msal = require('@azure/msal-node');
const axios = require('axios');

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

async function getAccessToken() {
  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}

async function sendBookingConfirmation(recipientEmail, booking) {
  try {
    const accessToken = await getAccessToken();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0056b3;">Meeting Room Booking Confirmed</h2>
        <p>Hello,</p>
        <p>Your reservation is confirmed:</p>
        <ul>
          <li><strong>Room:</strong> ${booking.roomId}</li>
          <li><strong>Date:</strong> ${booking.date}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Booked By:</strong> ${booking.bookedBy}</li>
        </ul>
      </div>
    `;

    const payload = {
      message: {
        subject: `Booking Confirmation: Room ${booking.roomId}`,
        body: {
          contentType: 'HTML',
          content: emailHtml,
        },
        toRecipients: [
          { emailAddress: { address: recipientEmail } },
        ],
      },
      saveToSentItems: 'true',
    };

    const endpoint = `https://graph.microsoft.com/v1.0/users/${process.env.SENDER_EMAIL}/sendMail`;

    await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Email notification sent to ${recipientEmail}`);
  } catch (error) {
    console.error('Error sending Graph API email:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = sendBookingConfirmation;