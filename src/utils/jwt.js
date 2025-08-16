/**
 * JWT helpers: sign/verify access & refresh, and hash token for DB storage.
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
  throw new Error('JWT secrets not set in env');
}

const signAccessToken = (payload = {}) => {
  const now = Math.floor(Date.now() / 1000);
  const jti = uuidv4(); // unique token id (useful for future blacklists)
  const opts = {
    algorithm: 'HS256',
    expiresIn: accessTokenExpiry,
    issuer,
    audience,
  };
  return jwt.sign(
    {
      ...payload,
      iat: now,
      jti,
    },
    accessTokenSecret,
    opts,
  );
};

const signRefreshToken = (payload = {}) => {
  const now = Math.floor(Date.now() / 1000);
  const jti = uuidv4();
  const opts = {
    algorithm: 'HS256',
    expiresIn: refreshTokenExpiry,
    issuer,
    audience,
  };
  return jwt.sign(
    { ...payload, iat: now, jti, typ: 'refresh' },
    refreshTokenSecret,
    opts,
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret, {
    algorithms: ['HS256'],
    issuer,
    audience,
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret, {
    algorithms: ['HS256'],
    issuer,
    audience,
  });
};

/** Hash a token for persistence (never store raw tokens in db) */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
