const rateLimit = require('express-rate-limit');

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different limits for different endpoints
const generalLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP'
);

const aiLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit AI interactions
  'Too many AI requests, please wait'
);

const creationLimit = createRateLimit(
  60 * 60 * 1000, // 1 hour
  5, // limit agent creation
  'Too many agent creation attempts'
);

module.exports = {
  generalLimit,
  aiLimit,
  creationLimit
};