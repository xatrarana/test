const mongoose = require("mongoose");

// Define a schema for the IP log
const ipLogSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a model based on the IP log schema
const IPLog = mongoose.model("IPLog", ipLogSchema);

module.exports = IPLog
