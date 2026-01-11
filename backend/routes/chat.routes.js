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
      .populate({
        path: 'lastMessage',
        select: 'message sender createdAt updatedAt deletedAt',
        populate: { path: 'sender', select: 'username name' }
      })
      .select('type name participants');
    const userContacts = conversations.map(conv => {
      let contactInfo;
      if (conv.type === 'global') {
        contactInfo = {
          name: 'Global Chat',
          username: null,
          photoURL: conv.photoURL
        };
      } else if (conv.type === 'group') {
        contactInfo = {
          name: conv.name,
          username: null,
          photoURL: conv.photoURL
        };
      } else {
        const otherParticipant = conv.participants.find(participant => participant._id.toString() !== req._id);
        contactInfo = {
          name: otherParticipant.name,
          username: otherParticipant.username,
          photoURL: otherParticipant.photoURL,
        };
      }
      return {
        ...contactInfo,
        type: conv.type,
        conversationId: conv._id,
        lastMessage: conv.lastMessage ? {
          message: conv.lastMessage.message,
          name: conv.lastMessage.sender.name,
          username: conv.lastMessage.sender.username,
          sentAt: conv.lastMessage.updatedAt || conv.lastMessage.createdAt,
          deletedAt: conv.lastMessage.deletedAt
        } : null
      };
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
    } else if (type === 'group') {
      const { usernames, name } = req.body;
      const userIds = [req._id];
      for (const username of usernames) {
        const user = await User.findOne({ username });
        if (user && user._id.toString() !== req._id) {
          userIds.push(user._id);
        }
      }
      const groupConversation = new Conversation({
        type: 'group',
        participants: userIds,
        admins: [req._id],
        name: name || 'New Group'
      });
      await groupConversation.save();

      emitToUsers([req._id], {
        type: 'NEW_CONTACT',
        contact: {
          name: groupConversation.name,
          username: null,
          photoURL: null,
          conversationId: groupConversation._id,
          type: 'group'
        },
        creatorId: req._id
      });

      emitToUsers(userIds.filter(id => id.toString() !== req._id), {
        type: 'NEW_CONTACT',
        contact: {
          name: groupConversation.name,
          username: null,
          photoURL: null,
          conversationId: groupConversation._id,
          type: 'group'
        },
        creatorId: req._id
      });
      return res.status(201).json({ message: 'New group chat created' });

    } else {
      return res.status(400).json({ message: 'Invalid conversation type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create new contact / group' });
  }
});

router.get('/chats/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const chats = await Message.find({ conversation: conversationId })
      .populate('sender', 'username name')
      .select('message createdAt editedAt deletedAt');
    const formatted = chats.map(chat => ({
      _id: chat._id,
      message: chat.message,
      username: chat.sender.username,
      userId: chat.sender._id,
      name: chat.sender.name,
      createdAt: chat.createdAt,
      editedAt: chat.editedAt,
      deletedAt: chat.deletedAt
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

export default router;