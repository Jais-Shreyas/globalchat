import { Schema, model } from 'mongoose';

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['global', 'private', 'group'],
      required: true
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    name: {
      type: String
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message'
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
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participants: 1 });

export default model('Conversation', conversationSchema);
