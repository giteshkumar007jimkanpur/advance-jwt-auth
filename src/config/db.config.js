const mongoose = require('mongoose');

const { nodeEnv } = require('./env');
const logger = require('../utils/logger');

// ignore query fields not in schema (safer, cleaner).
mongoose.set('strictQuery', true);

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri, {
      //builds schema indexes automatically (fine for dev, disable in prod).
      autoIndex: nodeEnv !== 'production',

      // up to 10 concurrent Mongo connections in pool.
      maxPoolSize: 10,
    });
    logger.info('✅ MongoDB Connected');
  } catch (error) {
    logger.error('❌ MongoDB connection error', error);
    throw error;
  }

  // Informational events
  mongoose.connection.on('disconnected', () =>
    logger.warn('MongoDB disconnected'),
  );
  mongoose.connection.on('reconnected', () =>
    logger.info('MongoDB reconnected'),
  );
};

module.exports = connectDB;
