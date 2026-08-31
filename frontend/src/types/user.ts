export type PublicUser = {
  _id: string;
  username: string;
  name: string;
  photo: {
    fileId: string;
    uploadId?: string;
    name: string;
    mimeType: string;
    size: number;
  } | null;
};

export type PrivateUser = PublicUser & {
  email: string;
};