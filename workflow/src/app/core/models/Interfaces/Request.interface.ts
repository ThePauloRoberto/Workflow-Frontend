import { Priority } from "../utils/Priority.enum";
import { Status } from "../utils/Status.enum";
import { RequestHistory } from "./Request-history.interface";
import { User } from "./User.entity";

export interface Request {
 id: string;                    // Guid no C# vira string no TypeScript
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: Status;
  create_by: string;             // Guid do usuário que criou
  created_at: Date;
  updated_at?: Date | null;

  // Relacionamentos (podem vir ou não da API)
  histories?: RequestHistory[];
  user?: User;
}
