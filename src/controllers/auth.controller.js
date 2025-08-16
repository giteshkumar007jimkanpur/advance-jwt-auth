const { User } = require('../models');
const { authService } = require('../services');
const { hashToken } = require('../utils/jwt');
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    let { email, name, password } = req.body;
    email = email?.toString().trim();
    name = name?.toString().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ email, passwordHash, name });
    const tokens = await authService.createTokens(user, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = email?.toString().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: `Invalid credentials` });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: `Invalid credentials` });

    const tokens = await authService.createTokens(user, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        password: user.password,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    let { refreshToken } = req.body;
    refreshToken = refreshToken?.toString().trim();
    const tokens = await authService.rotateRefreshToken(refreshToken, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    let { refreshToken } = req.body;
    refreshToken = refreshToken?.toString().trim();
    const wasRevoked = await authService.revokeRefreshToken(refreshToken);
    if (!wasRevoked) {
      const tokenHash = hashToken(refreshToken);
      logger.warn(
        `Attempt to logout with invalied or already revoked token (hash=${tokenHash.slice(
          0,
          8
        )}…)`
      );
      return res
        .status(400)
        .json({ message: `Invalid or already revoked refresh token` });
    }
    logger.info('Refresh token revoked successfully');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Error during logout', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
