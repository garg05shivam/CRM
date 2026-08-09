export type StockMovementType = "IN" | "OUT";

export interface StockMovementInput {
  productId: string;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface LowStockProduct {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStockQuantity: number;
  warehouseId: string;
  warehouseName: string;
}

export interface StockMovementResponse {
  success: boolean;
  message?: string;
  data: {
    movement: StockMovement;
    product: {
      id: string;
      productName: string;
      sku: string;
      currentStock: number;
    };
  };
}

import type { PaginationMeta } from "./pagination";

export interface StockMovementsResponse {
  success: boolean;
  data: StockMovement[];
  pagination?: PaginationMeta;
}

export interface LowStockResponse {
  success: boolean;
  data: LowStockProduct[];
}