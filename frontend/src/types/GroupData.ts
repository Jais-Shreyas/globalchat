import { PublicUser } from "./user";

export type GroupData = {
  name: string;
  type: 'group' | 'global';
  photoURL: string | null;
  memberList?: PublicUser[];
  admins?: PublicUser[];
  _id: string;
}