const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: false,
    validate: {
      validator: function (value) {
        // Regex pattern for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      },
      message: "Invalid email format",
    },
  },
  phone: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },

  token: {
    type: String,
    required: false,
  },
  resetPasswordExpires: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
UserSchema.methods.generatePasswordResetToken = async function () {
  // Generate a unique token, such as a random string or a UUID
  const resetToken = await generateUniqueToken(6);
  // Set the reset password expiration time
  const resetPasswordExpires = Date.now() + 120000; // 2 minutes from now
  // Save the token and expiration time to the user's fields
  this.token = resetToken;
  this.resetPasswordExpires = resetPasswordExpires;
  // Save the updated user data
  const savePromise = this.save();

  // Schedule the deletion of the token and expiration time after 2 minutes
  setTimeout(() => {
    this.token = undefined;
    this.resetPasswordExpires = undefined;
    this.save().catch((error) => {
      console.log("An error occurred while deleting the token:", error);
    });
  }, 120000); // 2 minutes

  return savePromise;
};

function generateUniqueToken(length) {
  return new Promise((resolve, reject) => {
    const characters = "0123456789";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }
    resolve(token);
  });
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
