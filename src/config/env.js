/**
 * Centralized env loader with required/optional vars and defaults.
 */

require('dotenv').config();

const must = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return process.env[name];
};

module.exports = {
  nodeEnv: must('NODE_ENV') || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: must('MONGO_URI'),

  accessTokenSecret: must('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: must('REFRESH_TOKEN_SECRET'),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',

  issuer: process.env.JWT_ISSUER || 'advance-jwt-auth',
  audience: process.env.JWT_AUDIENCE || 'advance-jwt-auth-client',
};
