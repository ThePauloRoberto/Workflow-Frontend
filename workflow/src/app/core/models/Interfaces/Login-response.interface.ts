import { User } from "./User.entity";

export interface LoginResponse {
  token: string;
  user: User;
}
