import { Schema, model } from 'mongoose';

const MessageSchema = new Schema(
  {
    message: {
      type: String,
      default: '',
    },
    image: {
      type: {
        url: String,
        publicId: String,
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
  const hasMessage =
    this.message &&
    this.message.trim().length > 0;

  const hasImage =
    this.image &&
    this.image.url;

  if (!hasMessage && !hasImage) {
    return next(
      new Error("Message or image is required")
    );
  }
  next();
});
export default model('Message', MessageSchema);