import express from 'express';
import Message from '../models/message.js';
import { authenticate } from '../middleware/authenticate.js'
import User from '../models/user.js';
import Conversation from '../models/conversation.js';
import { emitToUsers } from '../websocket/emitter.js';

const router = express.Router();

router.get('/contacts', authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req._id })
      .populate('participants', 'username name photoURL')
      .select('type name participants');
    const userContacts = conversations.map(conv => {
      let contactInfo;
      if (conv.type === 'global') {
        contactInfo = {
          name: 'Global Chat',
          username: null,
          photoURL: null
        };
      } else if (conv.type === 'group') {
        contactInfo = {
          name: conv.name,
          username: null,
          photoURL: null
        };
      } else {
        const otherParticipant = conv.participants.find(participant => participant._id.toString() !== req._id);
        contactInfo = {
          name: otherParticipant.name,
          username: otherParticipant.username,
          photoURL: otherParticipant.photoURL,
        };
      }
      return { ...contactInfo, type: conv.type, conversationId: conv._id };
    });
    res.status(200).json(userContacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

router.post('/contacts/new', authenticate, async (req, res) => {
  try {
    const { type, username: u } = req.body;
    if (type === 'private') {
      const user = await User.findById(req._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const otherUser = await User.findOne({ username: u });
      if (!otherUser) {
        return res.status(404).json({ message: `User "${u}" not found` });
      }
      if (otherUser._id.toString() === req._id) {
        return res.status(400).json({ message: 'Cannot create contact with yourself' });
      }
      let conversation = await Conversation.findOne({
        type: 'private',
        participants: { $all: [user._id, otherUser._id] }
      });
      const convExists = (conversation !== null);
      if (!convExists) {
        conversation = new Conversation({
          type: 'private',
          participants: [req._id, otherUser._id]
        });
        await conversation.save();
        emitToUsers([req._id], {
          type: 'NEW_CONTACT',
          contact: {
            name: otherUser.name,
            username: otherUser.username,
            photoURL: otherUser.photoURL,
            conversationId: conversation._id,
            type: 'private'
          },
          creatorId: req._id
        });
        emitToUsers([otherUser._id.toString()], {
          type: 'NEW_CONTACT',
          contact: {
            name: user.name,
            username: user.username,
            photoURL: user.photoURL,
            conversationId: conversation._id,
            type: 'private'
          },
          creatorId: req._id
        });
      }
      return res.status(201).json({ message: convExists ? 'Contact already exists' : 'New contact created' });
    } else {
      return res.status(400).json({ message: 'Invalid conversation type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create contact' });
  }
});

router.get('/chats/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const chats = await Message.find({ conversation: conversationId })
      .populate('sender', 'username name')
      .select('message createdAt');

    const formatted = chats.map(chat => ({
      _id: chat._id,
      message: chat.message,
      username: chat.sender.username,
      name: chat.sender.name,
      createdAt: chat.createdAt
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

export default router;