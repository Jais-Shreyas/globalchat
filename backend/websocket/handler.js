import Conversation from '../models/conversation.js';
import { insertMessage, updateMessage, deleteMessage } from '../services/chat.service.js';
import { Clients } from './clients.js';
import { emitToUsers } from './emitter.js';

export const handleWSConnection = (ws) => {
  console.log('New client connected');
  ws.on('message', async (raw) => {
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
    // Ensure the user is authenticated for any other task
    if (!ws.userId) {
      return ws.send(JSON.stringify({ type: "ERROR", message: "Not authenticated" }));
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
    console.log('Client disconnected');
    if (ws.username) {
      Clients.delete(ws.username);
    }
  });
};