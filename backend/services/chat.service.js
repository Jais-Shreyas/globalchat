import User from '../models/user.js';
import Message from '../models/message.js';
import { deleteFile } from './storage.service.js';

export const insertMessage = async (message, file, _id, convId) => {
  if ((typeof message !== "string" || !message.trim()) && !file) return;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  const chat = new Message({
    message,
    file,
    sender: user._id,
    conversation: convId
  });
  const inserted = await chat.save();
  return {
    _id: inserted._id,
    message: inserted.message,
    file: inserted.file,
    username: user.username,
    name: user.name,
    createdAt: inserted.createdAt
  };
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

  chat.message = message;
  chat.editedAt = new Date();
  await chat.save();
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
  try {
    if (chat.file) {
      await deleteFile(chat.file?.fileId); // Call deleteFile to remove the file from storage
    }
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw new Error("Unable to delete at the moment. Please try again later.");
  }
  chat.file = null;
  chat.editedAt = null;
  chat.deletedAt = new Date();
  chat.message = '⊘ _This message was deleted._';
  await chat.save();
  return chat;
};