import { apiRequest } from "./client";

import type {
  LowStockResponse,
  StockMovementInput,
  StockMovementResponse,
  StockMovementsResponse,
} from "../types/inventory";

export const createStockMovement = (
  data: StockMovementInput,
) => {
  return apiRequest<StockMovementResponse>(
    "/inventory/movements",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export interface GetStockMovementsParams {
  productId?: string;
  movementType?: "IN" | "OUT";
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getStockMovements = (
  params?: string | GetStockMovementsParams,
) => {
  const queryParams = new URLSearchParams();

  if (typeof params === "string") {
    if (params.trim()) queryParams.append("productId", params.trim());
  } else if (params) {
    if (params.productId?.trim()) queryParams.append("productId", params.productId.trim());
    if (params.movementType) queryParams.append("movementType", params.movementType);
    if (params.search?.trim()) queryParams.append("search", params.search.trim());
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.unpaginated) queryParams.append("unpaginated", "true");
  }

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiRequest<StockMovementsResponse>(
    `/inventory/movements${queryStr}`,
  );
};

export const getLowStockProducts = () => {
  return apiRequest<LowStockResponse>(
    "/inventory/low-stock",
  );
};