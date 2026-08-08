import { apiRequest } from "./client";

import type {
  ProductInput,
  ProductResponse,
  ProductsResponse,
  ProductUpdateInput,
  DeleteProductResponse,
} from "../types/product";

export const getProducts = (
  search?: string,
) => {
  const query = search?.trim()
    ? `?search=${encodeURIComponent(
        search.trim(),
      )}`
    : "";

  return apiRequest<ProductsResponse>(
    `/products${query}`,
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