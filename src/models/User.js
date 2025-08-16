/**
 * User model: stores email + password hash + optional profile fields.
 */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

//Virtual for comparing password
/** Compare a raw password to stored hash */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(String(password || ''), this.passwordHash);
};

/** Hash a raw password using bcrypt */
UserSchema.statics.hashPassword = function (password) {
  const saltRounds = 12;
  return bcrypt.hash(String(password || ''), saltRounds);
};

module.exports = mongoose.model('User', UserSchema);
