import { SortOrder } from '../enums/sort-order.enum';

export interface QueryParams {
  page?: number;
  size?: number;
  search?: string;
  sortColumn?: string;
  sortOrder?: SortOrder;
}
