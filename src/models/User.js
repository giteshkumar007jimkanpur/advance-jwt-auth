/**
 * User model: store email + hashed password + name
 */

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      lowercase: true,
      required: true,
      trim: true,
      type: String,
    },
    name: {
      default: '',
      trim: true,
      type: String,
    },
    passwordHash: {
      required: true,
      select: false,
      type: String,
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
  }
);

/** Virtual to compare the given password with stored (hashed) password */

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(String(password || ''), this.passwordHash);
};

UserSchema.statics.hashPassword = function (password) {
  const saltRounds = 12;
  return bcrypt.hash(String(password || ''), saltRounds);
};

// unique constraint for email
// index collation for email -> Abc@email.com and abc@email.com will have same (only one doc)
UserSchema.index(
  { email: 1 },
  { collation: { locale: 'en', strength: 2 }, unique: true }
);

//DB level email validation (also doing app level validation using Joi)
UserSchema.path('email').validate(
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  'Invalid email'
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
