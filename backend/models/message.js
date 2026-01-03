import { Schema, model } from 'mongoose';

const MessageSchema = new Schema(
  {
    message: {
      type: String,
      required: true
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
    }
  },
  {
    timestamps: true
  }
);
export default model('Message', MessageSchema);