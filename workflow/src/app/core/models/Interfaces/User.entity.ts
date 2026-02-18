import { Role } from "../utils/Role.enum";

export interface User {
  id: string;                    // Guid
  userName: string;              // IdentityUser tem UserName
  email: string;
  name: string;                  // Seu campo customizado
  isActive: boolean;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  // Para autenticação
  roles?: Role;
}
