export interface CreateChallanItemData {
  productId: string;
  quantity: number;
}

export interface CreateChallanData {
  customerId: string;
  items: CreateChallanItemData[];
}