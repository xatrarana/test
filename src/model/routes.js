const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug_name: {
    type: String,
    required: true,
  },
  wardno: {
    type: String,
    required: true,
  },
  images: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
  ],
});

const Route = mongoose.model("Route", RouteSchema);

module.exports = Route;
