const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const {
  accessTokenSecret,
  accessTokenExpiry,
  refreshTokenSecret,
  refreshTokenExpiry,
} = require("../config/env");

if (!accessTokenSecret || !refreshTokenSecret) {
  throw new Error("JWT secrets not set in env");
}

const signAccessToken = (payload) => {
  const opts = { expiresIn: accessTokenExpiry };
  return jwt.sign(payload, accessTokenSecret, opts);
};

const signRefreshToken = (payload) => {
  //include token id
  const jti = uuidv4();
  const opts = { expiresIn: refreshTokenExpiry };
  return jwt.sign({ ...payload, jwt }, refreshTokenSecret, opts);
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, accessTokenSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, refreshTokenSecret);
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
