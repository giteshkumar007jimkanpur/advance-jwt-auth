const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    require: true,
  },
  name: {
    type: String,
  },
});

//Virtual for comparing password
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.statics.hashPassword = function (password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

module.exports = mongoose.model('User', UserSchema);
