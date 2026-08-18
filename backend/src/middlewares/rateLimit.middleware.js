const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, error: 'Too many login attempts, please try again after a minute' }
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP per windowMs
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, error: 'Too many chat requests, please try again after a minute' }
});

module.exports = {
  loginLimiter,
  chatLimiter
};
