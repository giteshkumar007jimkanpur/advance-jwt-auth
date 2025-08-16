/**
 * RefreshToken model: store hashed refresh tokens with metadata & lifecycle.
 */
const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tokenHash: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    revoked: { type: Date, default: null },
    replacedByTokenHash: { type: String, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: false },
);

/** Virtuals for quick checks (non-persistent) */
RefreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.expiresAt;
});

RefreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
