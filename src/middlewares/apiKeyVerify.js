require("dotenv").config();
const checkApiKey = (req, res, next) => {
  const apiKey = req.query.apiKey;

  // Check if the API key is valid
  if (apiKey === process.env.apiKey) {
    // API key is valid, proceed to the next middleware or route handler
    next();
  } else {
    // API key is invalid, return an error response
    res.status(401).json({ sucess: false, message: "Invalid API key" });
  }
};
module.exports = checkApiKey;
