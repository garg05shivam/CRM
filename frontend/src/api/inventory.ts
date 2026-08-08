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

export const getStockMovements = (
  productId?: string,
) => {
  const query = productId
    ? `?productId=${encodeURIComponent(
        productId,
      )}`
    : "";

  return apiRequest<StockMovementsResponse>(
    `/inventory/movements${query}`,
  );
};

export const getLowStockProducts = () => {
  return apiRequest<LowStockResponse>(
    "/inventory/low-stock",
  );
};