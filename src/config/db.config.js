const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    logger.info("✅ MongoDB Connected");
  } catch (error) {
    logger.error("❌ MongoDB connection error", error);
    throw error; // important so server.js knows it failed
  }
};

module.exports = connectDB;
