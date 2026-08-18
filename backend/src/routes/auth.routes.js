const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');
const { validateLogin, validateChangePassword } = require('../middlewares/validation.middleware');

router.post('/login', loginLimiter, validateLogin, authController.login);
router.put('/change-password', authMiddleware, validateChangePassword, authController.changePassword);
router.get('/verify-token', authMiddleware, authController.verifyToken);
router.post('/refresh-token', authMiddleware, authController.refreshToken);

module.exports = router;
