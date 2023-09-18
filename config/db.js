const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
  try {
    // MongoDB connection string
    const connectionString = process.env.DATABASE_URL;

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
