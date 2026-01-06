import express from 'express';
import User from '../models/user.js'
import { authenticate } from '../middleware/authenticate.js'

const router = express.Router();

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

    const user = await User.findOne({ username }).select(
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

router.patch('/profile', authenticate, async (req, res) => {
  try {
    const id = req._id;
    const { photoURL, username, name, email } = req.body;
    if (!username && !name && !photoURL) {
      return res.status(400).json({
        message: 'Nothing to update',
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    const updatedData = await User.findByIdAndUpdate(id, { name, username, email, photoURL }, { new: true });
    res.status(200).json({ user: updatedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;