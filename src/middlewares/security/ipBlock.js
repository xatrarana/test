const IPLog = require("../../model/ipLog");

//store the block Ip address
const blockedIPs = new Set();
const blockIPs = async (req, res, next) => {
  try {
    const blockedIPs = await IPLog.find({ ip: req.ip });

    if (blockedIPs.length > 0) {
      console.log(`Blocked IP address: ${req.ip}`);
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (error) {
    console.error("Error checking blocked IP addresses:", error);
    next(); // Allow the request to proceed in case of error
  }
};

module.exports = blockIPs;
