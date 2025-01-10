const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// import mongoose from 'mongoose';
const UserSchema = new Schema({
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
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
// export default User;