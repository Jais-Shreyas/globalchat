import User from '../models/user.js';
import Chat from '../models/chat.js';

export const insertMessage = async (message, _id) => {
  if (typeof message !== "string" || !message.trim()) return;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  const chat = new Chat({
    message,
    user: user._id
  });
  const inserted = await chat.save();
  return { _id: inserted._id, message: inserted.message, username: user.username, name: user.name, createdAt: inserted.createdAt };
};

export const updateMessage = async (message, messageId, userId) => {
  if (typeof message !== "string" || !message.trim()) return;
  const chat = await Chat.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.user.toString() !== userId) {
    throw new Error("Unauthorized to edit this message");
  }
  chat.message = message.trim();
  await chat.save();
  return chat;
};

export const deleteMessage = async (messageId, userId) => {
  const chat = await Chat.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.user.toString() !== userId) {
    throw new Error("Unauthorized to delete this message");
  }
  await Chat.findByIdAndDelete(messageId);
};