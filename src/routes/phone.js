const express = require("express");
const { sendMobileOtp, verifyOtpMobile } = require("../controllers/phone");
const router = express.Router();

router.post("/otp", sendMobileOtp);
router.post("/verify", verifyOtpMobile);

module.exports = router;
