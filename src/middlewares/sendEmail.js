require("dotenv").config();
const emailjs = require("@emailjs/nodejs");

const sendEmail = (name, email, message) => {
  return new Promise((resolve, reject) => {
    const templateParams = {
      name: name,
      email: email,
      message: message,
    };
    emailjs
      .send(
        process.env.YOUR_SERVICE_ID,
        process.env.YOUR_TEMPLATE_ID,
        templateParams,
        {
          publicKey: process.env.PublicKey,
          privateKey: process.env.PrivateKey, // optional, highly recommended for security reasons
        }
      )
      .then(function (response) {
        console.log("SUCCESS!", response.status, response.text);
        resolve({
          success: true,
          response: response.status,
          response_text: response.text,
        });
      })
      .catch((err) => {
        console.log("FAILED...", err);
        reject({
          success: false,
          response: 400,
          error: err,
        });
      });
  });
};

module.exports = sendEmail;
