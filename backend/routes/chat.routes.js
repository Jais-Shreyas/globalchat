import express from 'express';
import Chat from '../models/chat.js';

const router = express.Router();

router.get('/chat', async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('user', 'username name')
      .select('message createdAt');

    const formatted = chats.map(chat => ({
      _id: chat._id,
      message: chat.message,
      username: chat.user.username,
      name: chat.user.name,
      createdAt: chat.createdAt
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

export default router;