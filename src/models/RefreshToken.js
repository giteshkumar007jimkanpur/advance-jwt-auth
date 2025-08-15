const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  tokenHash: { type: String, require: true, index: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, require: true },
  revoked: { type: Date },
  replacedByTokenHash: { type: String },
  ip: { type: String },
  userAgent: { type: String },
});

RefreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt;
});

RefreshTokenSchema.virtual("isActive").get(function () {
  return !this.revoked && !this.isExpired;
});

module.exports = mongoose.model("RefreshToken", RefreshTokenSchema);
