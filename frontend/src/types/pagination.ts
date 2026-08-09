export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  unpaginated?: boolean;
}
