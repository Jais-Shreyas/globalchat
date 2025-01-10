const mongoose = require('mongoose');
const User = require('./user');

const time = () => {
  const date = new Date();
  return date.toDateString().slice(4) + ' ' + date.toLocaleTimeString();
}

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: String,
    default: time
  }
});
module.exports = mongoose.model('Chat', chatSchema);