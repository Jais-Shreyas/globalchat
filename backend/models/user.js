const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  authType: {
    type: String,
    enum: ['local', 'google'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model('User', UserSchema);