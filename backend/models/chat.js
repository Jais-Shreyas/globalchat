import { Schema, model } from 'mongoose';

const chatSchema = new Schema(
  {
    message: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);
export default model('Chat', chatSchema);