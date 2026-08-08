import { apiRequest } from "./client";

import type {
  WarehousesResponse,
  WarehouseResponse,
} from "../types/warehouse";

export interface CreateWarehouseInput {
  name: string;
  location: string;
}

export interface UpdateWarehouseInput {
  name?: string;
  location?: string;
  isActive?: boolean;
}

export const getWarehouses = async () => {
  return apiRequest(
    "/warehouses",
  ) as Promise<WarehousesResponse>;
};

export const getWarehouse = async (
  id: string,
) => {
  return apiRequest(
    `/warehouses/${id}`,
  ) as Promise<WarehouseResponse>;
};

export const createWarehouse = async (
  data: CreateWarehouseInput,
) => {
  return apiRequest(
    "/warehouses",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  ) as Promise<WarehouseResponse>;
};

export const updateWarehouse = async (
  id: string,
  data: UpdateWarehouseInput,
) => {
  return apiRequest(
    `/warehouses/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  ) as Promise<WarehouseResponse>;
};

export const deleteWarehouse = async (
  id: string,
) => {
  return apiRequest(
    `/warehouses/${id}`,
    {
      method: "DELETE",
    },
  );
};