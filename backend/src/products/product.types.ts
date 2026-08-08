export interface CreateProductData {
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  minimumStockQuantity?: number;
  warehouseId: string;
}

export interface UpdateProductData {
  productName?: string;
  sku?: string;
  category?: string;
  unitPrice?: number;
  minimumStockQuantity?: number;
  warehouseId?: string;
  isActive?: boolean;
}