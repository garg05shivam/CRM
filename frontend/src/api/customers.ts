import { apiRequest } from "./client";
import type {
  Customer,
  CustomerInput,
  CustomerResponse,
  CustomersResponse,
  DeleteCustomerResponse,
} from "../types/customer";

export const getCustomers = (
  search?: string,
) => {
  const query = search?.trim()
    ? `?search=${encodeURIComponent(search.trim())}`
    : "";

  return apiRequest<CustomersResponse>(
    `/customers${query}`,
  );
};

export const getCustomer = (
  id: string,
) => {
  return apiRequest<CustomerResponse>(
    `/customers/${id}`,
  );
};

export const createCustomer = (
  data: CustomerInput,
) => {
  return apiRequest<CustomerResponse>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const updateCustomer = (
  id: string,
  data: Partial<CustomerInput>,
) => {
  return apiRequest<CustomerResponse>(
    `/customers/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

export const deleteCustomer = (
  id: string,
) => {
  return apiRequest<DeleteCustomerResponse>(
    `/customers/${id}`,
    {
      method: "DELETE",
    },
  );
};