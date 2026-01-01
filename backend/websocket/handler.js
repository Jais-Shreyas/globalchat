import { insertMessage, updateMessage, deleteMessage } from '../services/chat.service.js';

const Clients = new Map();

export const handleWSConnection = (ws) => {
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
    // Ensure the user is authenticated for any other task
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
};