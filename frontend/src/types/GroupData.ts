import { PublicUser } from "./user";

export type GroupData = {
  name: string;
  photoURL: string | null;
  memberList: PublicUser[];
  _id: string;
}