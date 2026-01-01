import { WebSocketServer } from 'ws';
import { handleWSConnection } from './handler.js'

export const initWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  wss.on('connection', handleWSConnection);
}