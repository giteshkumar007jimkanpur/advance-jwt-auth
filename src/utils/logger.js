/**
 * Winston logger with JSON in prod and pretty dev output.
 */

const { createLogger, format, transports } = require('winston');

const { nodeEnv } = require('../config/env');

const isProd = nodeEnv === 'production';

const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd
    ? format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    )
    : format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ level, message, timestamp, ...rest }) => {
        const meta = Object.keys(rest).length
          ? ` ${JSON.stringify(rest)}`
          : '';
        return `[${timestamp}] ${level}: ${message}${meta}`;
      }),
    ),
  transports: [new transports.Console()],
});

/** optional http level for morgan stream */
logger.http = (msg) => logger.log({ level: 'http', message: msg });

module.exports = logger;
