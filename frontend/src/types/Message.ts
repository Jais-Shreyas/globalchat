export type Message = {
  message: string;

  file: {
    fileId: string;
    name: string;
    mimeType: string;
    size: number;
  } | null;
  
  username: string;
  userId: string;
  name: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  _id: string;
}
