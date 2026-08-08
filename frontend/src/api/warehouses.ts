import { apiRequest } from "./client";

import type {
  WarehousesResponse,
  WarehouseResponse,
} from "../types/warehouse";

export const getWarehouses = () => {
  return apiRequest<WarehousesResponse>(
    "/warehouses",
  );
};

export const getWarehouse = (
  id: string,
) => {
  return apiRequest<WarehouseResponse>(
    `/warehouses/${id}`,
  );
};