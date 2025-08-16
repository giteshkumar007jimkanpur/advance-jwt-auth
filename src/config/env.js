require('dotenv').config();

const getEnvVar = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return process.env[name];
};

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: getEnvVar('MONGO_URI'),

  accessTokenSecret: getEnvVar('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: getEnvVar('REFRESH_TOKEN_SECRET'),

  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  nodeEnv: getEnvVar('NODE_ENV'),
};
