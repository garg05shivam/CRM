export interface Product {
  id: string;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockQuantity: number;
  warehouseId: string;
  warehouseName: string;
  warehouseLocation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  minimumStockQuantity?: number;
  warehouseId: string;
}

export interface ProductUpdateInput {
  productName?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  minimumStockQuantity?: number;
  warehouseId?: string;
  isActive?: boolean;
}

import type { PaginationMeta } from "./pagination";

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: PaginationMeta;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}