import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/user.routes.js';
import chatRoutes from './routes/chat.routes.js';

import { connectDB } from './config/db.js'
import { initWebSocket } from './websocket/index.js';
import { ensureGlobalConversation } from './bootstrap/globalConversation.js';

import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);

import cookieParser from 'cookie-parser';
app.use(cookieParser());

import dotenv from 'dotenv';
dotenv.config();

import methodOverride from 'method-override';
app.use(methodOverride('_method'));

import cors from 'cors';
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

connectDB();
ensureGlobalConversation();
initWebSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', chatRoutes);

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});