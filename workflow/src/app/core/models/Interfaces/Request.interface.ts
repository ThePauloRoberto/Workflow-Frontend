import { Priority } from "../utils/Priority.enum";
import { Status } from "../utils/Status.enum";
import { RequestHistory } from "./Request-history.interface";
import { User } from "./User.entity";

export interface Request {
 id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  create_by: string;
  created_at: Date;
  updated_at?: Date | null;

  histories?: RequestHistory[];
  user?: User;
}
