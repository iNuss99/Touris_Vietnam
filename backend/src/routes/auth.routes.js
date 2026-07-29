const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { loginLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/login', loginLimiter, authController.login);
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
