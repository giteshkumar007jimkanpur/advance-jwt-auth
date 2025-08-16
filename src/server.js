require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.config');
const { mongoUri, port } = require('./config/env');
const logger = require('./utils/logger');

(async () => {
  try {
    await connectDB(mongoUri);
    app.listen(port, () => logger.info(`🚀 Server running on port ${port}`));
  } catch (err) {
    logger.error('❌ Failed to start server', err);
    process.exit(1);
  }
})();
