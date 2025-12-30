import { Schema, model } from 'mongoose';
import User from './user.js';

const time = () => {
  const date = new Date();
  return date.toDateString().slice(4) + ' ' + date.toLocaleTimeString();
}

const chatSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: String,
    default: time
  }
});
export default model('Chat', chatSchema);