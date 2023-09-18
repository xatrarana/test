const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expired: {
    type: Boolean,
    default: false,
  },
});

phoneSchema.methods.expireAfterDuration = function (durationInMinutes) {
  const expirationTime = new Date(
    this.createdAt.getTime() + durationInMinutes * 60000
  );
  const currentTime = new Date();

  if (currentTime >= expirationTime) {
    this.expired = true;
  }
};

const Phone = mongoose.model("phone", phoneSchema);

module.exports = Phone;
