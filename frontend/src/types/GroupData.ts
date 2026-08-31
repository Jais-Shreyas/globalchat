import { PublicUser } from "./user";

export type GroupData = {
  name: string;
  type: 'group' | 'global';
  photo: {
    fileId: string;
    uploadId?: string;
    name: string;
    mimeType: string;
    size: number;
  } | null;
  memberList?: PublicUser[];
  admins?: PublicUser[];
  _id: string;
}