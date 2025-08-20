/**
 * Centralized error handler
 */

const { isProd } = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const payload = {
    code: err.code || undefined,
    message: err.publicMessage || err.message || 'Internal server error',
  };

  if (err.isJoi && err.details) {
    payload.message = 'Request validation error';
    payload.details = err.details.map((d) => d.message);
  }

  if (!isProd && err.stack) {
    payload.stack = err.stack;
  }

  logger.error('Unhandled error', { status, ...payload });
  res.status(status).json(payload);
};

module.exports = errorHandler;
