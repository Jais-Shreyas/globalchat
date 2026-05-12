import User from '../models/user.js';
import Message from '../models/message.js';
import cloudinary from '../config/cloudinary.js';

export const insertMessage = async (message, image, _id, convId) => {
  if ((typeof message !== "string" || !message.trim()) && !image) return;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  const chat = new Message({
    message,
    image,
    sender: user._id,
    conversation: convId
  });
  const inserted = await chat.save();
  return { _id: inserted._id, message: inserted.message, image: inserted.image, username: user.username, name: user.name, createdAt: inserted.createdAt };
};

export const updateMessage = async (message, image, messageId, userId) => {
  if (typeof message !== "string" || !message.trim()) return;
  const chat = await Message.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.sender.toString() !== userId) {
    throw new Error("Unauthorized to edit this message");
  }
  chat.message = message;
  if (chat.image && chat.image.publicId) {
    if (image && image.publicId !== chat.image.publicId) {
      await cloudinary.uploader.destroy(chat.image.publicId);
    }
  }
  chat.image = image;
  chat.editedAt = new Date();
  await chat.save();
  return chat;
};

export const deleteMessage = async (messageId, userId) => {
  console.log('Attempting to delete message with ID:', messageId, 'by user ID:', userId);
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
  try {
    if (chat.image && chat.image.publicId) {
      console.log('Deleting image associated with message, public ID:', chat.image.publicId);
      await cloudinary.uploader.destroy(chat.image.publicId);
      console.log('Image deleted successfully from Cloudinary');
      chat.image = null;
    }
  } catch (err) {
    console.error('Error deleting image from Cloudinary:', err);
  }
  await chat.save();
  return chat;
};