/**
 * JWT helpers: sign/verify access & refresh token
 * Hash the refresh token to store in DB.
 */

const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const {
  accessTokenExpiry,
  accessTokenSecret,
  audience,
  issuer,
  refreshTokenExpiry,
  refreshTokenSecret,
} = require('../config/env');

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error(`JWT secret not set in env`);
}

const signAccessToken = (payload = {}) => {
  const jti = uuidv4(); //unique token id (useful for future blacklist)
  const now = Math.floor(Date.now() / 1000);
  const opts = {
    algorithm: 'HS256',
    audience,
    expiresIn: accessTokenExpiry,
    issuer,
  };
  return jwt.sign(
    {
      ...payload,
      iat: now,
      jti,
      typ: 'access',
    },
    accessTokenSecret,
    opts
  );
};

const signRefreshToken = (payload = {}) => {
  const jti = uuidv4();
  const now = Math.floor(Date.now() / 1000);
  const opts = {
    algorithm: 'HS256',
    audience,
    expiresIn: refreshTokenExpiry,
    issuer,
  };
  return jwt.sign(
    {
      ...payload,
      iat: now,
      jti,
      typ: 'refresh',
    },
    refreshTokenSecret,
    opts
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret, {
    algorithms: ['HS256'],
    audience,
    issuer,
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret, {
    algorithms: ['HS256'],
    audience,
    issuer,
  });
};

/** Hash a token for persistance (never store raw token in db) */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
