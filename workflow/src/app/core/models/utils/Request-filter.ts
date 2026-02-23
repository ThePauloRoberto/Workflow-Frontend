import { Priority } from "./Priority.enum";
import { Status } from "./Status.enum";

export interface RequestFilter {
  status?: Status;
  category?: string;
  priority?: Priority;
  search?: string;
  createdBy?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: string;
}
