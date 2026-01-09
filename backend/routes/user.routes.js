import express from 'express';
import User from '../models/user.js'
import { authenticate } from '../middleware/authenticate.js'
import Conversation from '../models/conversation.js';

const router = express.Router();
const normalise = (str) => str?.trim().toLowerCase();

router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req._id).select(
    '_id username name email photoURL'
  );

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  res.status(200).json({ user });
});

router.get('/profile/:username', authenticate, async (req, res) => {
  try {
    const { username } = req.params;
    const nUsername = normalise(username);
    const user = await User.findOne({ username: nUsername }).select(
      'name username email photoURL'
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (user._id.toString() !== req._id) {
      user.email = undefined; // hide email for other users
    }

    res.status(200).json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

router.get('/group/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .select('name type photoURL participants admins')
      .populate('participants', 'username name photoURL')
      .populate('admins', 'username name photoURL');
    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found'
      });
    }
    if (conversation.type !== 'global' && conversation.type !== 'group') {
      return res.status(400).json({
        message: 'Invalid conversation type'
      });
    }
    if (conversation.type === 'global') {
      conversation.participants = [];
      conversation.admins = [];
    }
    res.status(200).json({ group: conversation });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

router.patch('/profile', authenticate, async (req, res) => {
  try {
    const id = req._id;
    const { photoURL, username, name, email } = req.body;

    const nUsername = normalise(username);
    const nEmail = normalise(email);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const matchCriteria = [];
    if (username) {
      matchCriteria.push({ username: nUsername });
    }
    if (email) {
      matchCriteria.push({ email: nEmail });
    }
    if (matchCriteria.length > 0) {
      const existingUser = await User.findOne({ $or: matchCriteria, _id: { $ne: id } });
      if (existingUser) {
        if (existingUser.username === nUsername) {
          return res.status(409).json({ message: 'Username already taken' });
        }
        if (existingUser.email === nEmail) {
          return res.status(409).json({ message: 'Email already in use' });
        }
      }
    }

    if (photoURL) user.photoURL = photoURL;
    if (username) user.username = nUsername;
    if (name) user.name = name;
    if (email) user.email = nEmail;
    if (!user.authType) user.authType = 'local';
    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/myContacts', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const conversations = await Conversation.find({ participants: req._id })
      .populate('participants', 'username name photoURL')
      .select('type name participants');

    const userContacts = conversations.map(conv => {
      let contactInfo;
      if (conv.type === 'private') {
        const otherParticipant = conv.participants.find(participant => participant._id.toString() !== req._id);
        contactInfo = {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          username: otherParticipant.username,
          photoURL: otherParticipant.photoURL,
        };
      }
      return contactInfo;
    }).filter(contact => contact !== undefined);

    res.status(200).json(userContacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});


router.patch('/group/:conversationId', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { name, admins, memberList, photoURL } = req.body;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants')
      .populate('admins');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    if (conversation.type !== 'group') {
      return res.status(400).json({ message: 'Invalid conversation type' });
    }
    if (conversation.admins.every(admin => admin._id.toString() !== req._id)) {
      return res.status(403).json({ message: 'Only admins can update group details' });
    }
    if (conversation.participants.every(member => member._id.toString() !== req._id)) {
      return res.status(403).json({ message: 'You must be a participant of the group' });
    }
    if (memberList.every(member => member._id.toString() !== req._id)) {
      return res.status(403).json({ message: 'You cannot leave the group' });
    }

    const memberIds = new Set(memberList.map(m => m._id));
    const newAdminList = admins.filter(admin =>
      memberIds.has(admin._id)
    );


    if (name) conversation.name = name;
    if (photoURL) conversation.photoURL = photoURL;
    conversation.participants = [...memberIds];
    conversation.admins = newAdminList;
    await conversation.save();

    const convUpdated = await Conversation.findById(conversationId)
      .select('name type photoURL participants admins')
      .populate('participants', 'username name photoURL')
      .populate('admins', 'username name photoURL');
    res.status(200).json({ group: convUpdated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;