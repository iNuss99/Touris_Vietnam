const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, error: 'Too many login attempts, please try again after a minute' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { success: false, error: 'Too many chat requests, please try again after a minute' }
});

module.exports = {
  loginLimiter,
  chatLimiter
};
