const { createLogger, format, transports } = require("winston");
const SECRET_KEYS = require("../config/env");

const logger = createLogger({
  level: SECRET_KEYS.nodeEnv === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [new transports.Console({ format: format.simple() })],
});

module.exports = logger;
