export type Message = {
  message: string;
  username: string;
  userId: string;
  name: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  _id: string;
}
