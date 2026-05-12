import { PublicUser } from "./user";

export type GroupData = {
  name: string;
  type: 'group' | 'global';
  photoURL: {
    url: string;
    publicId: string;
  } | null;
  memberList?: PublicUser[];
  admins?: PublicUser[];
  _id: string;
}