import { Role } from "../utils/Role.enum";

export interface User {
  id: string;
  userName: string;
  email: string;
  name: string;
  isActive: boolean;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  roles?: Role;
}
