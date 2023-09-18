const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Maximum number of requests allowed per windowMs
  handler: (req, res) => {
    // Handle rate limit exceeded
    res.status(429).json({ error: "Too Many Requests" });
  },
});

module.exports = limiter;
