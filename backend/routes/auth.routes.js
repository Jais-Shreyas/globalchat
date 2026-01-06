import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.js'
import { handleUserDataSend } from '../services/auth.service.js';
import Conversation from '../models/conversation.js';

const router = express.Router();

router.post('/googlelogin', async (req, res) => {
  try {
    const { displayName, email, uid, photoURL } = req.body;
    if (!displayName || !email || !uid) {
      return res.status(400).json({ message: 'Missing credentials' });
    }
    let userFound = await User.findOne({ googleId: uid });
    if (!userFound) {
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000 + 1);
      const newUser = new User({
        authType: 'google',
        name: displayName,
        email,
        username,
        googleId: uid,
        photoURL: photoURL
      });
      await newUser.save();

      // add this new user to global conversation
      let globalConv = await Conversation.findOne({ type: 'global' });
      globalConv.participants.push(newUser._id);
      await globalConv.save();

      userFound = newUser;
    }
    let modified = false;
    if (userFound.email !== email) {
      userFound.email = email;
      modified = true;
    }
    if (userFound.photoURL !== photoURL) {
      userFound.photoURL = photoURL;
      modified = true;
    }
    if (modified) {
      await userFound.save();
    }

    await handleUserDataSend(res, userFound);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = identifier.includes('@')
      ? await User.findOne({ email: identifier })
      : await User.findOne({ username: identifier });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (user.authType === 'google') {
      return res.status(409).json({
        message: 'This account uses Google login, please login with Google'
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    await handleUserDataSend(res, user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        message: 'Username already taken'
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      authType: 'local',
      name,
      username,
      email,
      password: hashedPassword,
    });
    await user.save();

    // add this new user to global conversation
    let globalConv = await Conversation.findOne({ type: 'global' });
    globalConv.participants.push(user._id);
    await globalConv.save();
    
    await handleUserDataSend(res, user);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

// router.post('/logout', (req, res) => {
//   const isProd = process.env.NODE_ENV === 'production';
//   res.status(200).json({ message: 'Logged out successfully' });
// });

export default router;