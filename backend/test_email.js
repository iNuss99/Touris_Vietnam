require('dotenv').config();
const { sendWelcomeEmail } = require('./src/services/email_service');

(async () => {
  try {
    await sendWelcomeEmail({
      to: process.env.GMAIL_USER,
      fullName: 'Test User',
      role: 'editor',
      tempPassword: 'password123'
    });
    console.log('Email sent successfully!');
  } catch (err) {
    console.error('Error sending email:', err);
  }
})();
