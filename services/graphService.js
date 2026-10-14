require('dotenv').config();
const msal = require('@azure/msal-node');
const axios = require('axios');

// Configure MSAL with Azure AD credentials
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
};

const cca = new msal.ConfidentialClientApplication(msalConfig);

// Helper function to acquire access token
async function getAccessToken() {
  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };
  const response = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}

/**
 * Sends an email notification using Microsoft Graph API
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlMessage - Email body formatted in HTML
 */
async function sendBookingNotification(toEmail, subject, htmlMessage) {
  try {
    const accessToken = await getAccessToken();

    const payload = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: htmlMessage,
        },
        toRecipients: [
          {
            emailAddress: { address: toEmail },
          },
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

    console.log('Notification email sent successfully to:', toEmail);
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendBookingNotification };