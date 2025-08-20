/**
 * Winston logger with JSON in prod and pretty dev output.
 */
const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { nodeEnv } = require('../config/env');
const { getContext } = require('../utils/request-context');

const isProd = nodeEnv === 'production';

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Global startup ID for logs outside requests
const startupId = uuidv4();

// Add requestId automatically if available
const addRequestId = format((info) => {
  const ctx = getContext();
  info.requestId = ctx?.requestId || info.requestId || startupId;
  return info;
});

const logger = createLogger({
  format: isProd
    ? format.combine(
        addRequestId(),
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      )
    : format.combine(
        addRequestId(),
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, requestId, timestamp, ...rest }) => {
          const meta = Object.keys(rest).length
            ? ` ${JSON.stringify(rest)}`
            : '';
          return `[${timestamp}] ${level}: ${message}${
            requestId ? ` (requestId=${requestId})` : ''
          }${meta}`;
        })
      ),
  level: isProd ? 'http' : 'debug',
  transports: isProd
    ? [
        new transports.Console(),
        // error logs with rotation
        new DailyRotateFile({
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: 'error-%DATE%.log',
          level: 'error',
          maxFiles: '14d', // keep 14 days
          zippedArchive: true,
        }),

        // combined logs with rotation
        new DailyRotateFile({
          datePattern: 'YYYY-MM-DD',
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          maxFiles: '14d',
          zippedArchive: true,
        }),
      ]
    : [new transports.Console()],
});

/** optional http level for morgan stream */
logger.http = (msg) => logger.log({ level: 'http', message: msg });

module.exports = logger;
