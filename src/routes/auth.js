const express = require("express");
const {
  createUser,
  userLogin,
  forgotPassword,
  verfyOTP,
  resetPassword,
  dashboardLogin,
} = require("../controllers/user");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

router.post("/login", userLogin);
router.post("/admin", dashboardLogin);
router.post("/signup", createUser);

//handle forgot password
router.post("/forgot", forgotPassword);
router.post("/verify", verfyOTP);
router.put("/reset-password", verifyToken, resetPassword);
module.exports = router;
