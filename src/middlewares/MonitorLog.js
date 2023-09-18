// middleware/monitorMiddleware.js

// Monitor log object to store the request data
const monitorLog = {};

// Middleware to log requests and count how many times it's been called from each IP
const monitorMiddleware = (req, res, next) => {
  // Get the actual client IP address from the X-Forwarded-For header
  const clientIP = req.headers['x-real-ip'] || req.connection.remoteAddress;
  const endpoint = req.originalUrl;

  if (!monitorLog[clientIP]) {
    monitorLog[clientIP] = { requests: 1, endpoints: { [endpoint]: 1 } };
  } else {
    monitorLog[clientIP].requests++;
    if (!monitorLog[clientIP].endpoints[endpoint]) {
      monitorLog[clientIP].endpoints[endpoint] = 1;
    } else {
      monitorLog[clientIP].endpoints[endpoint]++;
    }
  }

  next();
};

module.exports = { monitorMiddleware, monitorLog };
