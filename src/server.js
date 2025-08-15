require("dotenv").config();
const { port, mongoUri } = require("./config/env");
const connectDB = require("./config/db.config");
const app = require("./app");
const logger = require("./utils/logger");

(async () => {
  try {
    await connectDB(mongoUri);
    app.listen(port, () => logger.info(`🚀 Server running on port ${port}`));
  } catch (err) {
    logger.error("❌ Failed to start server", err);
    process.exit(1);
  }
})();
