require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.tokenKey
  );

  return token;
};

const decodeToken = (token) => {
  try {
    const decode = jwt.verify(token, process.env.tokenKey);
    if (!decode) {
      throw new Error("invalid token");
    }
    return decode;
  } catch (error) {
    console.log(error);
    return error;
  }
};
module.exports = { generateToken, decodeToken };
