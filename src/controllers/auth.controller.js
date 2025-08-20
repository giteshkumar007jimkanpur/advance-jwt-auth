/**
 * Authentication controller: register, login, refresh, logout
 * Minimal logic here, delegate to service and models.
 */

const { User } = require('../models');
const { authService } = require('../services');
const { hashToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/** POST /auth/register */
const register = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim();

    const password = String(req.body.password || '').trim();

    const name = String(req.body.name || '').trim();

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: 'Email already registered.',
      });
    }

    const passwordHash = await User.hashPassword(password);

    const user = await User.create({
      email,
      name,
      passwordHash,
    });

    const tokens = await authService.createToken(user, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    logger.info('User registered', {
      email: user.email,
      name: user.name,
      userId: user._id,
    });

    return res.status(201).json({
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const tokens = await authService.createToken(user, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return res.status(200).json({
      user: {
        email: user.email,
        id: user._id,
        name: user.name,
      },
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const refreshToken = String(req.body.refreshToken || '').trim();
    const tokens = await authService.rotateRefreshToken(refreshToken, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    logger.info('Refresh token rotated', { ip: req.ip });
    return res.status(200).json({
      message: 'Tokens refreshed ...',
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = String(req.body.refreshToken || '').trim();

    const wasEvoked = await authService.revokeRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    if (wasEvoked) {
      logger.info(
        `Refresh token revoked successfully, token (hash=${tokenHash.slice(0, 8)}...)`
      );
    } else {
      logger.warn(
        `Attempt to logout with invalid or already revoked refresh token, (hash=${tokenHash.slice(0, 8)}...)`
      );
    }
    /**
     * Always respond with 200 OK (even if the token wasn’t found).
     */
    return res.status(200).json({
      message: 'Logout successfully ...',
    });
  } catch (error) {
    logger.error('Error during logout', { error: error.message });

    // Example of de-centralized error
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller: Logout from all devices
const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user.id.toString();
    const revokedCount = await authService.revokeAllRefreshTokens(userId);

    if (revokedCount > 0) {
      logger.info(`Revoked ${revokedCount} refresh tokens for user ${userId}`);
      return res.status(200).json({ message: 'Logged out from all devices.' });
    }
    logger.info(`No active refresh tokens to revoke for user ${userId}`);
    return res
      .status(200)
      .json({ message: 'No active sessions to log out from.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  logoutAll,
  refreshTokens,
  register,
};
