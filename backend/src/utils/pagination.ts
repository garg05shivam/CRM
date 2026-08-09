export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export const parsePaginationParams = (
  query: Record<string, unknown>,
  defaultLimit = 10,
  maxLimit = 100,
): PaginationParams => {
  let page = Number.parseInt(String(query.page || 1), 10);
  let limit = Number.parseInt(String(query.limit || defaultLimit), 10);

  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }

  if (Number.isNaN(limit) || limit < 1) {
    limit = defaultLimit;
  } else if (limit > maxLimit) {
    limit = maxLimit;
  }

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

export const buildPaginationMeta = (
  total: number,
  params: PaginationParams,
): PaginationMeta => {
  const totalPages = Math.ceil(total / params.limit) || 1;

  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
  };
};
