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
    name: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participants: 1 });

export default model('Conversation', conversationSchema);
