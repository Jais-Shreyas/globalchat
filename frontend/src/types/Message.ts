export type Message = {
  message: string;
  image: {
    url: string;
    publicId: string;
  } | null;
  username: string;
  userId: string;
  name: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  _id: string;
}
