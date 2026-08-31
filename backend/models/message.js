import { Schema, model } from 'mongoose';

const MessageSchema = new Schema(
  {
    message: {
      type: String,
      default: '',
    },
    file: {
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
      default: null,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    editedAt: {
      type: Date,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

MessageSchema.pre("validate", function (next) {
  const hasMessage = this.message && this.message.trim().length > 0;

  const hasFile = this.file && this.file.fileId;

  if (!hasMessage && !hasFile) {
    return next(
      new Error("Message or image is required")
    );
  }
  next();
});

export default model('Message', MessageSchema);