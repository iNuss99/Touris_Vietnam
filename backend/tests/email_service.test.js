const test = require('node:test');
const assert = require('node:assert/strict');
const { 
  getTransporter, 
  getDefaultFrom, 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendBookingConfirmationEmail 
} = require('../src/services/email_service');

test('emailService - throws when credentials are not configured', () => {
  const oldEnv = { ...process.env };
  try {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    assert.throws(() => {
      getTransporter();
    }, /Chưa cấu hình thông tin SMTP/);
  } finally {
    process.env = oldEnv;
  }
});

test('emailService - creates transport when Gmail credentials provided', () => {
  const oldEnv = { ...process.env };
  try {
    delete process.env.SMTP_HOST;
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'app-password-123';

    const transporter = getTransporter();
    assert.ok(transporter);
    assert.ok(typeof transporter.sendMail === 'function');
  } finally {
    process.env = oldEnv;
  }
});

test('emailService - creates custom SMTP transport when SMTP_HOST provided', () => {
  const oldEnv = { ...process.env };
  try {
    process.env.SMTP_HOST = 'smtp.sendgrid.net';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'apikey';
    process.env.SMTP_PASS = 'SG.secret-token';

    const transporter = getTransporter();
    assert.ok(transporter);
    assert.ok(typeof transporter.sendMail === 'function');
  } finally {
    process.env = oldEnv;
  }
});

test('emailService - getDefaultFrom returns proper sender', () => {
  const oldEnv = { ...process.env };
  try {
    process.env.EMAIL_FROM = '"Vietnam Luxury" <custom@vietnamjourney.com>';
    assert.equal(getDefaultFrom(), '"Vietnam Luxury" <custom@vietnamjourney.com>');

    delete process.env.EMAIL_FROM;
    process.env.GMAIL_USER = 'admin@vietnamjourney.com';
    assert.equal(getDefaultFrom(), '"Vietnam Journey" <admin@vietnamjourney.com>');
  } finally {
    process.env = oldEnv;
  }
});

test('emailService - sendBookingConfirmationEmail validates email input', async () => {
  const resEmpty = await sendBookingConfirmationEmail({ to: '' });
  assert.equal(resEmpty.success, false);
  assert.match(resEmpty.error, /hợp lệ/);

  const resInvalid = await sendBookingConfirmationEmail({ to: 'invalid-email' });
  assert.equal(resInvalid.success, false);
  assert.match(resInvalid.error, /hợp lệ/);
});

test('emailService - gracefully handles send errors without crashing', async () => {
  const oldEnv = { ...process.env };
  try {
    delete process.env.GMAIL_USER;
    delete process.env.GMAIL_APP_PASSWORD;
    delete process.env.SMTP_HOST;

    const res = await sendWelcomeEmail({
      to: 'user@example.com',
      fullName: 'Test User',
      role: 'staff',
      tempPassword: 'pass123'
    });

    assert.equal(res.success, false);
    assert.ok(res.error);
  } finally {
    process.env = oldEnv;
  }
});
