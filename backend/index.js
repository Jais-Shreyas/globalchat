const express = require('express');
const app = express();
const User = require('./models/user');
const Chat = require('./models/chat');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');
app.use(cors({ origin: process.env.VITE_FRONTEND_URL, credentials: true }));

let allChatsCache = [];
const mongoose = require('mongoose');
const mongoUri = process.env.VITE_MONGO_URI;
async function run() {
  try {
    mongoose.connect(mongoUri);
  } finally {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    allChatsCache = await Chat.find().populate('user');
    allChatsCache = allChatsCache.map((chat, i) => {
      return { _id: chat._id, message: chat.message, username: chat.user.username, createdAt: chat.createdAt };
    });
    console.log("All chats cached successfully!");
  }
}
run().catch(console.dir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.send({ isValid: false, message: 'Invalid username or password' });
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      res.send({ isValid: true, user });
    } else {
      res.send({ isValid: false, message: 'Invalid username or password' });
    }
  });

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
    const user = new User({ name, username, email });
    const hash = await bcrypt.hash(password, 12);
    user.password = hash;
    await user.save();
    res.send({ isValid: true, user });
  } catch (e) {
    console.log(e)
    res.send({ isValid: false, message: 'Something went wrong' });
  }
});

app.get('/chat', async (req, res) => {
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
  console.log(inserted);
  allChatsCache.push({ _id: inserted._id, message: inserted.message, username: inserted.user.username, createdAt: inserted.createdAt })
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
  const globalchatadmin = await User.findOne({ username: 'globalchatkaadmin' });
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
  // console.log(chat);
  // console.log(user_id);
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

// app.post('/logout', (req, res) => {
//   req.logout(function (err) {
//     if (err) {
//       console.log(err);
//       return next(err);
//     }
//     res.send({ isValid: true });
//   });
// });


app.listen(3000, () => {
  console.log('Server is running on port 3000');
});