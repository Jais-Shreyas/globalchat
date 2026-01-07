export type PublicUser = {
  _id: string;
  username: string;
  name: string;
  photoURL: string | null;
};

export type PrivateUser = PublicUser & {
  email: string;
};