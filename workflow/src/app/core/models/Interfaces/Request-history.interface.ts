import { Status } from "../utils/Status.enum";
import { User } from "./User.entity";

export interface RequestHistory {
  id: string;
  requestId: string;
  action: string;
  description: string;
  userId: string;
  createdAt: Date;
  oldValue: string;
  newValue: string;

  request?: Request;
  user?: User;
}
