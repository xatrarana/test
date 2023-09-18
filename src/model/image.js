const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  data: {
    type: Buffer,
    required: true,
  },
  mimeType: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
