import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';
import filesRoutes from './routes/files.routes.js';

import { connectDB } from './config/db.js'
import { initWebSocket } from './websocket/index.js';
import { ensureGlobalConversation } from './bootstrap/globalConversation.js';

import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);

import dotenv from 'dotenv';
dotenv.config();

import methodOverride from 'method-override';
app.use(methodOverride('_method'));

import cors from 'cors';
app.use(cors({ origin: process.env.FRONTEND_URL }));

const startServer = async () => {
  try {
    await connectDB();
    await ensureGlobalConversation();
    initWebSocket(server);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.set('trust proxy', 1);

    app.use('/health', (req, res) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    app.use('/', authRoutes);
    app.use('/', profileRoutes);
    app.use('/', chatRoutes);
    app.use('/files', filesRoutes);

    server.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();