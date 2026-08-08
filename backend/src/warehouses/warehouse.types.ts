export interface CreateWarehouseData {
  name: string;
  location: string;
}

export interface UpdateWarehouseData {
  name?: string;
  location?: string;
  isActive?: boolean;
}