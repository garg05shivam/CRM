export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
}

export interface WarehousesResponse {
  success: boolean;
  data: Warehouse[];
}

export interface WarehouseResponse {
  success: boolean;
  message?: string;
  data: Warehouse;
}