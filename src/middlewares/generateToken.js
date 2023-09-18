require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.tokenKey
  );

  return token;
};

module.exports = generateToken;
