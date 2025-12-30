import express, { json, urlencoded } from 'express';
const app = express();
import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.js';
import Chat from './models/chat.js';
import bcrypt from 'bcrypt';

import methodOverride from 'method-override';
app.use(methodOverride('_method'));

import cors from 'cors';
app.use(cors({ origin: process.env.VITE_FRONTEND_URL, credentials: true }));

let allChatsCache = [];
const giveTodayDate = () => {
  return new Date().toLocaleDateString();
}

let lastrefresh = giveTodayDate();
const refreshChat = async () => {
  allChatsCache = await Chat.find().populate('user');
  lastrefresh = giveTodayDate();
  allChatsCache = allChatsCache.map((chat, i) => {
    return { _id: chat._id, message: chat.message, username: chat.user.username, name: chat.user.name, createdAt: chat.createdAt };
  });
}

import { connect } from 'mongoose';
async function run() {
  try {
    const mongoUri = process.env.VITE_MONGO_URI;
    connect(mongoUri);
  } finally {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    refreshChat();
    console.log("All chats cached successfully!");
  }
}
run().catch(console.dir);

app.use(json());
app.use(urlencoded({ extended: true }));

app.post('/googlelogin', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.send({ isValid: false, message: 'Invalid credentials' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000 + 1);
    const newUser = new User({
      authType: 'google',
      name,
      email,
      username
    });
    await newUser.save();
    res.send({ isValid: true, user: newUser });
  } else {
    res.send({ isValid: true, user: { name: user.name, email: user.email, _id: user._id, username: user.username } });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email.includes('@')) {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.send({ isValid: false, message: 'Invalid username or password' });
    }
    if (user.authType == 'google') {
      return res.send({ isValid: false, message: 'The email was registered using google, please use Google login' });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        res.send({ isValid: true, user: { name: user.name, email: user.email, _id: user._id, username: user.username } });
      } else {
        res.send({ isValid: false, message: 'Invalid username or password' });
      }
    });
  } else {
    const user = await User.findOne({ username: email });
    if (!user) {
      return res.send({ isValid: false, message: 'Invalid username or password' });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        res.send({ isValid: true, user: { name: user.name, email: user.email, _id: user._id, username: user.username } });
      } else {
        res.send({ isValid: false, message: 'Invalid username or password' });
      }
    });
  }
});

app.post('/signup', async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      return res.send({ isValid: false, message: 'Username already taken' });
    }
    const foundEmail = await User.findOne({ email });
    if (foundEmail) {
      return res.send({ isValid: false, message: 'Email already registered' });
    }
    const user = new User({ authType: 'local', name, username, email });
    const hash = await bcrypt._hash(password, 12);
    user.password = hash;
    await user.save();
    res.send({ isValid: true, user: { name: user.name, email: user.email, _id: user._id, username: user.username } });
  } catch (e) {
    console.log(e)
    res.send({ isValid: false, message: 'Something went wrong' });
  }
});

app.get('/profile/:username/:id', async (req, res) => {
  const { username, id } = req.params;
  if (!username) {
    return res.send({ isValid: false, message: 'Invalid username' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.send({ isValid: false, message: 'Invalid username' });
  }
  if (user._id != id) {
    res.send({
      isValid: true,
      user: {
        name: user.name,
        username: user.username,
      }
    })
  } else {
    res.send({
      isValid: true,
      user: {
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  }
});

app.patch('/profile/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.send({ isValid: false, message: 'Invalid id' });
  }
  const { oldUsername, newUsername, newName } = req.body;
  if (!oldUsername || !newUsername) {
    return res.send({ isValid: false, message: 'Missing Usernames' });
  }
  const user = await User.findById(id);
  if (user.username != oldUsername) {
    return res.send({ isValid: false, message: 'Invalid Credentials' });
  }
  const checkNewUser = await User.findOne({ username: newUsername });
  if (checkNewUser && oldUsername != newUsername) {
    return res.send({ isValid: false, message: 'Username already taken, please try another one.' });
  }
  const updatedData = await User.findByIdAndUpdate(id, { username: newUsername, name: newName }, { new: true });
  refreshChat();
  res.send({ isValid: true, user: updatedData });
})

app.get('/chat', async (req, res) => {
  if (lastrefresh != giveTodayDate()) {
    refreshChat();
    console.log("Refreshing due to date change.");
  }
  return res.send(allChatsCache || []);
});

app.post('/chat', async (req, res) => {
  const { message, username, id, createdAt } = req.body;
  if (!username || !message) {
    return res.send({ isValid: false, message: 'Please login to chat' });
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.send({ isValid: false, message: 'Please login to chat' });
  }
  if (user._id != id) {
    return res.send({ isValid: false, message: 'Improper credentials' });
  }
  if (!createdAt) {
    console.log('Time error, please try again.');
    return res.send({ isValid: false, message: 'Invalid time' });
  }
  const chat = new Chat({
    message,
    user,
    createdAt
  });
  const inserted = await chat.save();
  allChatsCache.push({ _id: inserted._id, message: inserted.message, username: inserted.user.username, name: inserted.user.name, createdAt: inserted.createdAt })
  res.send({ isValid: true });
});

app.delete('/chat/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!id) {
    return res.send({ isValid: false, message: 'Invalid id' });
  }
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.send({ isValid: false, message: 'Invalid id' });
  }
  const globalchatadmin = await User.findOne({ email: process.env.GLOBAL_CHAT_ADMIN });
  if (chat.user != user_id && user_id != globalchatadmin._id) {
    return res.send({ isValid: false, message: 'Improper credentials' });
  }
  await Chat.findByIdAndDelete(id);
  allChatsCache = allChatsCache.filter((chat) => chat._id != id);
  res.send({ isValid: true, id });
});

app.patch('/chat/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.send({ isValid: false, message: 'Invalid id' });
  }
  const { message, user_id } = req.body;
  const chat = await Chat.findById(id);
  if (!chat) {
    return res.send({ isValid: false, message: 'Invalid id' });
  }
  if (chat.user != user_id) {
    return res.send({ isValid: false, message: 'Improper credentials' });
  }
  await Chat.findByIdAndUpdate(id, { message });
  allChatsCache = allChatsCache.map((chat) => {
    if (chat._id == id) {
      chat.message = message;
    }
    return chat;
  });
  res.send({ isValid: true, id });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});