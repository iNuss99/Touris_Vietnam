const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');
const { validateLogin, validateChangePassword } = require('../middlewares/validation.middleware');

const { verifySmtpConnection } = require('../services/email_service');

router.post('/login', loginLimiter, validateLogin, authController.login);
router.put('/change-password', authMiddleware, validateChangePassword, authController.changePassword);
router.get('/verify-token', authMiddleware, authController.verifyToken);
router.post('/refresh-token', authMiddleware, authController.refreshToken);
router.get('/smtp-status', async (req, res) => {
  const result = await verifySmtpConnection();
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  res.json({
    configured: !!(user && (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS)),
    user: user ? user.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
    status: result
  });
});

module.exports = router;
