const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // Solana/Anchor specific errors
  if (err.message.includes('Account does not exist')) {
    return res.status(404).json({
      success: false,
      error: 'Agent not found',
      code: 'AGENT_NOT_FOUND'
    });
  }

  // Validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details.map(d => d.message),
      code: 'VALIDATION_ERROR'
    });
  }

  // OpenAI API errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'AI service rate limit exceeded',
      code: 'AI_RATE_LIMIT'
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    code: 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;