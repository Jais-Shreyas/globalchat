import { Clients } from './clients.js';

export const emitToUsers = (userIds, data) => {
  try {
    userIds.forEach(userId => {
      const clientWs = Clients.get(userId);
      if (clientWs && clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(data));
      }
    });
  } catch (err) {
    throw err;
  }
}