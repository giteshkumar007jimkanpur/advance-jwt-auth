const { verifyAccessToken } = require("../utils/jwt");
const logger = require("../utils/logger");

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log(`authHeader`, authHeader);
    if (!authHeader?.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "Access token missing or malformed" });
    }

    const accessToken = authHeader.split(" ")[1];
    const payload = verifyAccessToken(accessToken);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      logger.warn("Access token expired", { error: error.message });
      return res.status(401).json({ message: "Access token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      logger.warn("Invalid access token", { error: error.message });
      return res.status(401).json({ message: "Invalid access token" });
    }
    next(error);
  }
};

module.exports = authenticate;
