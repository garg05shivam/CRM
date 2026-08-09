import { apiRequest } from "./client";

import type {
  ProductInput,
  ProductResponse,
  ProductsResponse,
  ProductUpdateInput,
  DeleteProductResponse,
} from "../types/product";

export interface GetProductsParams {
  search?: string;
  category?: string;
  warehouseId?: string;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getProducts = (
  params?: string | GetProductsParams,
) => {
  const queryParams = new URLSearchParams();

  if (typeof params === "string") {
    if (params.trim()) queryParams.append("search", params.trim());
  } else if (params) {
    if (params.search?.trim()) queryParams.append("search", params.search.trim());
    if (params.category) queryParams.append("category", params.category);
    if (params.warehouseId) queryParams.append("warehouseId", params.warehouseId);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.unpaginated) queryParams.append("unpaginated", "true");
  }

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiRequest<ProductsResponse>(
    `/products${queryStr}`,
  );
};

export const getProduct = (
  id: string,
) => {
  return apiRequest<ProductResponse>(
    `/products/${id}`,
  );
};

export const createProduct = (
  data: ProductInput,
) => {
  return apiRequest<ProductResponse>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const updateProduct = (
  id: string,
  data: ProductUpdateInput,
) => {
  return apiRequest<ProductResponse>(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

export const deleteProduct = (
  id: string,
) => {
  return apiRequest<DeleteProductResponse>(
    `/products/${id}`,
    {
      method: "DELETE",
    },
  );
};