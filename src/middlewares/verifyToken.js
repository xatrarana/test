require("dotenv").config();
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ sucess: false, message: "Unauthorized" });
  }
  const token = authHeader?.split(" ")[1];
  try {
    if (token == null)
      return res
        .status(401)
        .json({ sucess: false, message: "token is required" });
    jwt.verify(token, process.env.tokenKey, (err, user) => {
      if (err)
        return res
          .status(401)
          .json({ sucess: false, message: "token is not valid" });
      req.user = user;

      next();
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ sucess: false, message: "server error", error });
  }
};

module.exports = verifyToken;
