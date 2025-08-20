/**
 * Server entry: connect DB, start http server, and handle graceful shutdown
 */

const app = require('./app');
const connectDB = require('./config/db.config');
const { mongoUri, port } = require('./config/env');
const logger = require('./utils/logger');

let server;

(async () => {
  try {
    await connectDB(mongoUri);
    server = app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', error);
    process.exit(1);
  }
})();

/** Graceful shutdown on common signals/errors */
const shutdown = (signal, code = 0) => {
  logger.warn(`🔻 Received ${signal}, shutting down...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }
  process.exit(code);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  logger.error('uncaughtException', error);
  shutdown('uncaughtException', 1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection', reason);
  shutdown('unhandledRejection', 1);
});
