// business logic for tokens: create, rotate, revoke

const {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { refreshTokenExpiry } = require("../config/env");
const { RefreshToken } = require("../models");

const createTokens = async (user, meta = {}) => {
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
  });

  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    email: user.email,
  });
  const refreshTokenHash = hashToken(refreshToken);

  const expiresIn = refreshTokenExpiry;

  const msIn = expiresIn.endsWith("d")
    ? parseInt(expiresIn) * 24 * 60 * 60 * 1000
    : 30 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + msIn);

  const refreshTokenDoc = await RefreshToken.create({
    user: user._id,
    tokenHash: refreshTokenHash,
    expiresAt,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { accessToken, refreshToken, refreshTokenDoc };
};

/**
 * rotateRefreshToken: called when refresh endpoint receives a refresh token
 * - verify JWT signature
 * - find hashed token in DB
 * - if not found -> possible reuse -> revoke all tokens for user
 * - if found and active -> revoke it and store replacedBy token
 * - issue new pair and store new hashed refresh
 */

const rotateRefreshToken = async (presentedToken, meta = {}) => {
  let payload;
  try {
    payload = verifyRefreshToken(presentedToken);
  } catch (err) {
    throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
  }

  const tokenHash = hashToken(presentedToken);

  const existing = await RefreshToken.findOne({ tokenHash }).populate("user");

  // if token not found and token reuse or already revoked -> security event.
  // Revoke all refresh tokens for this user id if we can.
  if (!existing) {
    logger.warn(`Refresh token reuse detected for tokenhash=${tokenHash}`);
    if (payload && payload.sub) {
      const updateFilter = { user: payload.sub, revoked: { $exists: false } };
      await RefreshToken.updateMany(updateFilter, { revoked: new Date() });
    }

    throw Object.assign(
      new Error("Refresh token reuse detected; all sessions revoked"),
      { status: 401 }
    );
  }

  // if token found but not active
  if (!existing.isActive) {
    // already revoked or expired
    throw Object.assign(new Error("Refresh token not active"), { status: 401 });
  }

  const { accessToken, refreshToken, refreshTokenDoc } = await createTokens(
    existing.user,
    meta
  );

  // revoked current refresh token and link it to new one

  existing.revoked = new Date();
  existing.replacedByTokenHash = hashToken(refreshToken);
  await existing.save();

  return { accessToken, refreshToken };
};

// revoke refresh token when user logout
const revokeRefreshToken = async (presentedToken) => {
  const tokenHash = hashToken(presentedToken);
  const now = new Date();

  // Only match those who are NOT already revoked
  const result = await RefreshToken.updateOne(
    {
      tokenHash,
      revoked: { $in: [null, undefined] },
    },
    {
      $set: { revoked: now },
    }
  );
  return result.modifiedCount === 1;
};

module.exports = {
  createTokens,
  rotateRefreshToken,
  revokeRefreshToken,
};
