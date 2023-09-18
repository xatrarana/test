const mongoose = require("mongoose");
mongoose.Promise = Promise;
const PlaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
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
  category: {
    type: String,
    required: true,
  },
  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  rating: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      userRating: {
        type: Number,
        required: true,
      },
    },
  ],
  totalRating: {
    type: Number,
    default: 0,
  },
});

const Place = mongoose.model("Place", PlaceSchema);

//actions

module.exports = Place;
