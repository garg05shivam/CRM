export type StockMovementType = "IN" | "OUT";

export interface StockMovementData {
  productId: string;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
}