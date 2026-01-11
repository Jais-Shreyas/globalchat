import User from '../models/user.js';
import Message from '../models/message.js';

export const insertMessage = async (message, _id, convId) => {
  if (typeof message !== "string" || !message.trim()) return;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  const chat = new Message({
    message,
    sender: user._id,
    conversation: convId
  });
  const inserted = await chat.save();
  return { _id: inserted._id, message: inserted.message, username: user.username, name: user.name, createdAt: inserted.createdAt };
};

export const updateMessage = async (message, messageId, userId) => {
  if (typeof message !== "string" || !message.trim()) return;
  const chat = await Message.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.sender.toString() !== userId) {
    throw new Error("Unauthorized to edit this message");
  }
  if (chat.message !== message.trim()) {
    chat.message = message.trim();
    chat.editedAt = new Date();
    console.log('Editing message:', chat);
    await chat.save();
  }
  return chat;
};

export const deleteMessage = async (messageId, userId) => {
  const chat = await Message.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.sender.toString() !== userId) {
    throw new Error("Unauthorized to delete this message");
  }
  chat.editedAt = null;
  chat.deletedAt = new Date();
  chat.message = '⊘ _This message was deleted._';
  await chat.save();
  return chat;
};