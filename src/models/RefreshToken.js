/**
 * RefreshToken mode: Store hashed refresh token with meta data and lifecycle
 */

const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
  {
    createdAt: {
      default: Date.now,
      type: Date,
    },
    expiresAt: {
      required: true,
      type: Date,
    },
    ip: {
      default: null,
      type: String,
    },
    replacedByHash: {
      default: null,
      type: String,
    },
    revoked: { default: null, type: Date },
    tokenHash: {
      required: true,
      type: String,
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    userAgent: {
      default: null,
      type: String,
    },
  },
  { timestamps: false }
);

/** Unique index on tokenHash → no duplicate tokens */
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
/** Inline shortcut (unique: true) -> add unique index */

/**
 * TTL (Time-To-Live) index on expiresAt -> automatically deletes documents after a certain time
 * No need to create CRON Job to delete refresh tokens
 */

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
/** Does not hinder Global logout flow */

/**
 * Compound index on  { user, revoked } ->  fast queries for active tokens per user
 */
RefreshTokenSchema.index({ revoked: 1, user: 1 }, {});

/** Virtuals for quick checks (non-persitent) */

RefreshTokenSchema.virtual('isExpired').get(function () {
  return Date.now() >= (this.expiresAt ? this.expiresAt.getTime() : 0);
});

RefreshTokenSchema.virtual('isActive').get(function () {
  return !this.revoked && !this.isExpired;
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = RefreshToken;
