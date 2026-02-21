import { IEntity } from '@uimssn/base_module/utils/abstract/database/i-enity';

export class PaginatedResultDto<T extends IEntity> {
  data: T[];
  // Cursor-based pagination fields
  nextCursor: T[keyof T] | null;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  previousCursor: T[keyof T] | null;

  // Number (page) pagination metadata
  total?: number;
  page?: number; // 1-based
  pageCount?: number;
  limit?: number;
}