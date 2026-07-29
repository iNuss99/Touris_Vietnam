const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { chatLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/', chatLimiter, chatController.chat);

module.exports = router;
