export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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