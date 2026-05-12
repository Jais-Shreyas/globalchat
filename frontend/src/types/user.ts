export type PublicUser = {
  _id: string;
  username: string;
  name: string;
  photoURL: {
    url: string;
    publicId: string;
  } | null;
};

export type PrivateUser = PublicUser & {
  email: string;
};