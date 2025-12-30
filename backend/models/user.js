import { Schema, model } from 'mongoose';
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

export default model('User', UserSchema);