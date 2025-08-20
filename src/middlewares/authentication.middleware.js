/**
 * Authenticate requests using Bearer access token, attaches req.user on success.
 */

const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader?.startsWith('Bearer ')) {
      logger.warn('Access token missing or malformed');
      return res
        .status(401)
        .json({ message: 'Access token missing or malformed' });
    }

    const accessToken = authHeader.split(' ')[1];
    const payload = verifyAccessToken(accessToken);
    req.user = { email: payload.email, id: payload.sub, jti: payload.jti };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired', { error: error.message });
      return res.status(401).json({ message: 'Access token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token', { error: error.message });
      return res.status(401).json({ message: 'Invalid access token' });
    }
    next(error);
  }
};

module.exports = authenticate;
