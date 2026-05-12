export type Contact = {
  name: string;
  type: 'global' | 'private' | 'group';
  username: string | null;
  photoURL: {
    url: string;
    publicId: string;
  } | null;
  conversationId: string;
  lastMessage: {
    message: string;
    name: string;
    username: string;
    sentAt: string;
    deletedAt: Date | null;
  } | null;
}
