import jwt from 'jsonwebtoken';
import Conversation from '../models/conversation.js';
import { insertMessage, updateMessage, deleteMessage } from '../services/chat.service.js';
import { Clients } from './clients.js';
import { emitToUsers } from './emitter.js';

export const handleWSConnection = (ws, req) => {
  try {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const token = params.get('token');

    if (!token) {
      ws.close(1008, 'Authentication token missing');
      return;
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    ws.userId = payload._id;
    Clients.set(ws.userId, ws);

    console.log(`User authenticated with ID: ${ws.userId}`);
  } catch (err) {
    ws.close(1008, 'Authentication failed');
    return;
  }

  ws.on('message', async (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (e) {
      ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON format" }));
      return;
    }

    if (data.type === 'NEW_MESSAGE') {
      const { message, conversationId } = data;

      const conversation = await Conversation.findById(conversationId).select('participants');
      if (!conversation) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Conversation not found" }));
      }

      const participantIds = conversation.participants.map(id => id.toString());
      if (!participantIds.includes(ws.userId)) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized to send message in this conversation" }));
      }
      try {
        const insertedMessage = await insertMessage(message, ws.userId, conversationId);
        emitToUsers(participantIds, {
          type: 'NEW_MESSAGE',
          ...insertedMessage,
          messageId: insertedMessage._id,
          conversationId
        });

      } catch (err) {
        console.error('Error saving message:', err);
        ws.send(JSON.stringify({ type: "ERROR", message: err.message }));
      }
    } else if (data.type === 'UPDATE_MESSAGE') {
      const { message, messageId, conversationId } = data;

      const conversation = await Conversation.findById(conversationId).select('participants');
      if (!conversation) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Conversation not found" }));
      }

      const participantIds = conversation.participants.map(id => id.toString());
      if (!participantIds.includes(ws.userId)) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized to update message in this conversation" }));
      }

      try {
        const updatedMessage = await updateMessage(message, messageId, ws.userId)
        emitToUsers(participantIds, {
          type: 'UPDATE_MESSAGE',
          messageId: updatedMessage._id,
          message: updatedMessage.message,
          conversationId
        });
      } catch (err) {
        console.error('Error updating message:', err);
        ws.send(JSON.stringify({ type: "ERROR", message: err.message }));
      }
    } else if (data.type === 'DELETE_MESSAGE') {
      const { messageId, conversationId } = data;
      const conversation = await Conversation.findById(conversationId).select('participants');
      if (!conversation) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Conversation not found" }));
      }
      const participantIds = conversation.participants.map(id => id.toString());
      if (!participantIds.includes(ws.userId)) {
        return ws.send(JSON.stringify({ type: "ERROR", message: "Unauthorized to delete message in this conversation" }));
      }

      try {
        await deleteMessage(messageId, ws.userId);
        emitToUsers(participantIds, {
          type: 'DELETE_MESSAGE',
          messageId,
          conversationId
        });
      } catch (err) {
        console.error('Error deleting message:', err);
        ws.send(JSON.stringify({
          type: "ERROR",
          message: err.message
        }));
      }
    } else {
      ws.send(JSON.stringify({ type: "ERROR", message: "Unknown message type" }));
    }
  });
  ws.on('close', () => {
    if (ws.userId) {
      console.log(`Connection closed for user ID: ${ws.userId}`);
      Clients.delete(ws.userId);
    }
  });
};