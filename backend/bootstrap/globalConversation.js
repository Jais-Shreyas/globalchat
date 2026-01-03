import Conversation from '../models/conversation.js';
import User from '../models/user.js';

export const ensureGlobalConversation = async () => {
  let globalConv = await Conversation.findOne({ type: 'global' });
  if (!globalConv) {
    console.log('Creating global conversation...');
    const users = await User.find({}, '_id');
    const participantIds = users.map(user => user._id);  
    globalConv = new Conversation({ type: 'global', participants: participantIds, name: 'Global Chat'});
    await globalConv.save();
  } else {
    console.log('Global conversation already exists.');
  }
  return globalConv;
}