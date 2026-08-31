export type Contact = {
  name: string;
  type: 'global' | 'private' | 'group';
  username: string | null;
  photo: {
    fileId: string;
    name: string;
    mimeType: string;
    size: number;
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
