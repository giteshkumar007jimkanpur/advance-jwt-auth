const { nodeEnv } = require('../config/env');
const logger = require('../utils/logger');

module.exports = (err, _req, res, _next) => {
  logger.error('Unhandled error', { err });
  const status = err.status || 500;
  const payload = {
    message: err.message || 'Internal Server Error',
  };
  if (nodeEnv !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};
