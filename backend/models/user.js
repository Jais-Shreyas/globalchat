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
      lowercase: true,
      trim: true,
      match: /^[a-z0-9._]+$/
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
    photo: {
      type: {
        fileId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        mimeType: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
      },
      default: null
    },
    darkMode: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default model('User', UserSchema);