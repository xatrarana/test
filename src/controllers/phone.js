const axios = require("axios");
const generateUniqueToken = require("../middlewares/otpGen");
const Phone = require("../model/phone");
require("dotenv").config();
const sendMobileOtp = async (req, res) => {
  if (!req.body.phone)
    return res
      .status(400)
      .json({ success: false, message: "Phone field shouldn't be empty." });
  const { phone } = req.body;

  const otp = await generateUniqueToken(6);
  const url = "http://api.sparrowsms.com/v2/sms/";
  const data = {
    token: process.env.otpToken,
    from: "Demo",
    to: phone,
    text: `Your Guide-App code is ${otp} Don't share @panautimun.gov.np #${otp}`,
  };
  try {
    const exist = await Phone.findOne({ phoneNumber: phone });
    if (exist) {
      return res
        .status(403)
        .json({ success: false, message: "Phone number already exists." });
    }
    const response = await axios.post(url, data);
    console.log(response);
    if (response) {
      const data = new Phone({
        phoneNumber: phone,
        otp: otp,
      });
      await data.expireAfterDuration(4);
      await data.save();

      return res.status(200).json({
        success: true,
        data: response.data,
        message: "OTP sent sucessfully.",
      });
    }

    return res
      .status(400)
      .json({ success: false, message: "Error while sending OTP" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error?.message });
  }
};

const verifyOtpMobile = async (req, res) => {
  if (!req.body.otp) {
    return res
      .status(400)
      .json({ success: false, message: "otp filed is required." });
  }
  const { otp, phone } = req.body;

  try {
    const phoneEx = await Phone.findOne({ phoneNumber: phone });

    if (otp !== phoneEx.otp) {
      return res
        .status(404)
        .json({ sucess: false, message: "error in phone no verification." });
    }
    return res
      .status(200)
      .json({ sucess: true, message: "Phone number verified" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: `Internal server error :${error}` });
  }
};
module.exports = { sendMobileOtp, verifyOtpMobile };
