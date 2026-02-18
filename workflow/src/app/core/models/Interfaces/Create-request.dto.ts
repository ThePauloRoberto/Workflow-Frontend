import { Priority } from "../utils/Priority.enum";

export interface CreateRequestDto {
  title: string;
  description: string;
  category: string;
  priority: Priority;
}
