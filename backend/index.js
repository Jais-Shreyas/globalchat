import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

import cookieParser from 'cookie-parser';
app.use(cookieParser());

import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.js';
import Chat from './models/chat.js';
import bcrypt from 'bcrypt';

import methodOverride from 'method-override';
app.use(methodOverride('_method'));

import cors from 'cors';
app.use(cors({ origin: process.env.VITE_FRONTEND_URL, credentials: true }));

import { connect } from 'mongoose';
async function run() {
  try {
    const mongoUri = process.env.VITE_MONGO_URI;
    connect(mongoUri);
  } finally {
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
}
run().catch(console.dir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authenticate = (req, res, next) => {
  const token = req.cookies.auth;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req._id = payload._id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

app.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req._id).select(
    '_id username name email photoURL'
  );

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }
  if (!user.photoURL) {
    user.photoURL = `${process.env.VITE_FRONTEND_URL}/defaultDP.jpg`;
  }
  res.status(201).json({ user });
});

const handleUserSendingData = async (res, user) => {
  console.log("Handling user data sending for user:", user);
  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.status(201).json({
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email
    }
  });
};


app.post('/googlelogin', async (req, res) => {
  try {
    const user = req.body.user;
    const { displayName, email, uid, photoURL } = user;
    if (!displayName || !email || !uid) {
      return res.status(400).json({ message: 'Missing credentials' });
    }
    let userFound = await User.findOne({ googleId: uid });
    console.log("User: ", userFound);
    if (!userFound) {
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000 + 1);
      const newUser = new User({
        authType: 'google',
        name: displayName,
        email,
        username,
        googleId: uid,
        photoURL: photoURL || `${process.env.VITE_FRONTEND_URL}/defaultDP.jpg`
      });
      await newUser.save();
      userFound = newUser;
    }
    await handleUserSendingData(res, userFound);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
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
      return res.status(400).json({
        message: 'This account uses Google login, please login with Google'
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    await handleUserSendingData(res, user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/signup', async (req, res) => {
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
    await handleUserSendingData(res, user);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/profile/:username', authenticate, async (req, res) => {
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

    res.status(201).json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.patch('/profile', authenticate, async (req, res) => {
  try {
    const id = req._id;
    const { photoURL, username, name } = req.body;
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
    const updatedData = await User.findByIdAndUpdate(id, { username, name, photoURL }, { new: true });
    res.status(201).json({ user: updatedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
})

const getAllChats = async () => {
  const allChats = await Chat.find().populate('user');
  return allChats.map((chat, i) => {
    const { username, name } = chat.user;
    return { _id: chat._id, message: chat.message, username, name, createdAt: chat.createdAt };
  });
};

app.get('/chat', async (req, res) => {
  const allChats = await getAllChats();
  res.json(allChats);
});

const insertMessage = async (message, _id) => {
  if (typeof message !== "string" || !message.trim()) return;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  const chat = new Chat({
    message,
    user: user._id
  });
  const inserted = await chat.save();
  return { _id: inserted._id, message: inserted.message, username: user.username, name: user.name, createdAt: inserted.createdAt };
};

const updateMessage = async (message, messageId, userId) => {
  if (typeof message !== "string" || !message.trim()) return;
  const chat = await Chat.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.user.toString() !== userId) {
    throw new Error("Unauthorized to edit this message");
  }
  chat.message = message.trim();
  await chat.save();
  return chat;
};

const deleteMessage = async (messageId, userId) => {
  const chat = await Chat.findById(messageId);
  if (!chat) {
    throw new Error("Chat message not found");
  }
  if (chat.user.toString() !== userId) {
    throw new Error("Unauthorized to delete this message");
  }
  await Chat.findByIdAndDelete(messageId);
};

const Clients = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON format" }));
      return;
    }
    if (data.type === 'AUTH') {
      if (!data.userId || typeof data.userId !== 'string') {
        ws.send(JSON.stringify({ type: "ERROR", message: "Invalid authentication data" }));
        ws.close();
        return;
      }

      ws.userId = data.userId;
      Clients.set(ws.userId, ws);
      console.log(`User authenticated with ID: ${ws.userId}`);
      return;
    }
    // Ensure the user is authenticated
    if (!ws.userId) {
      ws.send(JSON.stringify({
        type: "ERROR",
        message: "Not authenticated"
      }));
      return;
    }
    if (data.type === 'NEW_MESSAGE') {
      const { message } = data;
      insertMessage(message, ws.userId)
        .then((savedMessage) => {
          // Broadcast to all connected clients
          Clients.forEach((clientWs, username) => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'NEW_MESSAGE',
                _id: savedMessage._id,
                message: savedMessage.message,
                username: savedMessage.username,
                name: savedMessage.name,
                createdAt: savedMessage.createdAt
              }));
            }
          });
        })
        .catch((err) => {
          console.error('Error saving message:', err);
          ws.send(JSON.stringify({
            type: "ERROR",
            message: err.message
          }));
        });
    } else if (data.type === 'UPDATE_MESSAGE') {
      const { message, messageId } = data;
      updateMessage(message, messageId, ws.userId)
        .then((updatedMessage) => {
          Clients.forEach((clientWs, username) => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'UPDATE_MESSAGE',
                _id: updatedMessage._id,
                message: updatedMessage.message
              }));
            }
          });
        })
        .catch((err) => {
          console.error('Error updating message:', err);
          ws.send(JSON.stringify({
            type: "ERROR",
            message: err.message
          }));
        });
    } else if (data.type === 'DELETE_MESSAGE') {
      const { messageId } = data;
      deleteMessage(messageId, ws.userId)
        .then(() => {
          Clients.forEach((clientWs, username) => {
            if (clientWs.readyState === clientWs.OPEN) {
              clientWs.send(JSON.stringify({
                type: 'DELETE_MESSAGE',
                _id: messageId
              }));
            }
          });
        })
        .catch((err) => {
          console.error('Error deleting message:', err);
          ws.send(JSON.stringify({
            type: "ERROR",
            message: err.message
          }));
        });
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.username) {
      Clients.delete(ws.username);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});