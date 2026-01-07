export type Contact = {
  name: string;
  type: 'global' | 'private' | 'group';
  username: string | null;
  photoURL: string | null;
  conversationId: string;
  lastMessage: {
    message: string;
    name: string;
    username: string;
    sentAt: string;
  } | null;
}
