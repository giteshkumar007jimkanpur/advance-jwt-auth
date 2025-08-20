/** Business logic for authentication: create access and rotate token pairs
 * Revoke refresh tokens
 */

const ms = require('ms');
const sanitize = require('sanitize-html');

const { refreshTokenExpiry } = require('../config/env');
const { RefreshToken } = require('../models');
const {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const logger = require('../utils/logger');

const safeUserAgent = (ua) => {
  if (!ua || typeof ua !== 'string') {
    return 'unknown';
  }

  return sanitize(ua, {
    allowedAttributes: [],
    allowedTags: [],
  }).slice(0, 255);
};

/**
 * Create a access+refresh tokens pair and store hashed refresh token in persistent.
 * @param {object} user - mongoose user document
 * @param {object} meta - ip, userAgent
 */
const createToken = async (user, meta = {}) => {
  const accessToken = signAccessToken({
    email: user.email,
    sub: user._id.toString(),
  });

  const refreshToken = signRefreshToken({
    email: user.email,
    sub: user._id.toString(),
  });

  const refreshTokenHash = hashToken(refreshToken);

  const expiresIn = refreshTokenExpiry;
  const msIn = ms(expiresIn);
  const expiresAt = new Date(msIn + Date.now());

  const query = {
    expiresAt,
    ip: typeof meta?.ip === 'string' ? meta?.ip.slice(0, 45) : undefined,
    tokenHash: refreshTokenHash,
    user: user._id,
    userAgent: safeUserAgent(meta?.userAgent),
  };
  await RefreshToken.create(query);

  return { accessToken, refreshToken };
};

/**
 * Rotate Refresh Token- called when refresh endpoint recieves a refresh token
 * - verify refresh token
 * - find hashed refresh token in db
 * - if not found means reuse -> security event -> revoke all refresh token for that user
 * - if found but not active(revoked or expired) -> throw error
 * - if found create new pair of access + refresh token (store new hashed refresh token in db),
 * - store replacedByHash (hash of new refresh token) in current hashedToken
 *
 * @param {string} presentedToken - provided refresh token
 * @param {object} meta - ip, userAgent
 */
const rotateRefreshToken = async (presentedToken, meta = {}) => {
  let payload;
  try {
    payload = verifyRefreshToken(presentedToken);
  } catch (error) {
    throw Object.assign(
      new Error('Invalid refresh token', {
        cause: error.message,
        status: 401,
      })
    );
  }

  const tokenHash = hashToken(presentedToken);

  const existing = await RefreshToken.findOne({ tokenHash }).populate('user');

  /**
   * Refresh token not found in DB, but the JWT payload is valid.
   * Means reuse/forgery
   * Then revoke all (non-revoked) refresh tokens of that user -> Global Logout
   * Recommended in OWASP Refresh Token Reuse Detection
   */

  if (!existing) {
    logger.warn('Refresh token reuse detected', {
      sub: payload?.sub,
      tokenHashPrefix: tokenHash.slice(0, 8),
    });
    if (payload?.sub) {
      // revoke all non-revoked tokens of that user
      const updateFilter = {
        revoked: null,
        user: payload?.sub,
      };
      const now = new Date();
      await RefreshToken.updateMany(updateFilter, {
        $set: { revoked: now },
      });
    }
    const err = new Error('Refresh token reuse detected, all sessions revoked');
    err.status = 401;
    throw err;
  }

  /**
   * Refresh token found in DB, but it is not active (expired or revoked)
   * Then throw error
   * No need for global logout -> Too aggressive
   */

  // Token exists but not active
  if (!existing.isActive) {
    const err = new Error('Refresh token not active');
    err.status = 401;
    throw err;
  }

  /** Revoke existing first, then issue new */

  existing.revoked = new Date();

  const { accessToken, refreshToken } = await createToken(existing.user, meta);

  existing.replacedByHash = hashToken(refreshToken);

  await existing.save();

  return { accessToken, refreshToken };
};

/**
 * Revoke a refresh token -  called when a user want to logout.
 * @param {string} presentedToken - refresh token
 */
const revokeRefreshToken = async (presentedToken) => {
  const tokenHash = hashToken(presentedToken);
  const now = new Date();

  const result = await RefreshToken.updateOne(
    {
      revoked: null,
      tokenHash,
    },
    {
      $set: { revoked: now },
    }
  );

  return result.modifiedCount === 1;
};

/**
 * Logout-all: Revoke all unrevoked refresh token of a user.
 * @param {string} userId - mongoose document id
 */
const revokeAllRefreshTokens = async (userId) => {
  const updateFilter = {
    revoked: null,
    user: userId,
  };
  const now = new Date();
  const result = await RefreshToken.updateMany(updateFilter, {
    $set: { revoked: now },
  });

  return result.modifiedCount;
};

module.exports = {
  createToken,
  revokeAllRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
};
