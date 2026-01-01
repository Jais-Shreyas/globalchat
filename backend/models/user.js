import { Schema, model } from 'mongoose';
const UserSchema = new Schema(
  {
    authType: {
      type: String,
      enum: ['local', 'google'],
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: function () {
        return this.authType === 'local';
      }
    },
    googleId: {
      type: String,
      unique: true,
      required: function () {
        return this.authType === 'google';
      }
    },
    photoURL: {
      type: String
    },
    darkMode: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default model('User', UserSchema);