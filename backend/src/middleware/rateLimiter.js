const { RateLimiterMemory } = require('rate-limiter-flexible');

// Auth rate limiter: 5 requests per minute
const authLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

const rateLimiterMiddleware = (limiter) => async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await limiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    });
  }
};

module.exports = {
  authRateLimiter: rateLimiterMiddleware(authLimiter),
};
