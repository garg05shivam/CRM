export type ChallanStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "CANCELLED";

export interface ChallanItemInput {
  productId: string;
  quantity: number;
}

export interface CreateChallanInput {
  customerId: string;
  items: ChallanItemInput[];
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  createdAt: string;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  items?: ChallanItem[];
}

import type { PaginationMeta } from "./pagination";

export interface ChallansResponse {
  success: boolean;
  data: Challan[];
  pagination?: PaginationMeta;
}

export interface ChallanResponse {
  success: boolean;
  message?: string;
  data: Challan;
}