import { apiRequest } from "./client";
import type {
  CustomerInput,
  CustomerResponse,
  CustomersResponse,
  DeleteCustomerResponse,
} from "../types/customer";

export interface GetCustomersParams {
  search?: string;
  status?: string;
  customerType?: string;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getCustomers = (
  params?: string | GetCustomersParams,
) => {
  const queryParams = new URLSearchParams();

  if (typeof params === "string") {
    if (params.trim()) queryParams.append("search", params.trim());
  } else if (params) {
    if (params.search?.trim()) queryParams.append("search", params.search.trim());
    if (params.status) queryParams.append("status", params.status);
    if (params.customerType) queryParams.append("customerType", params.customerType);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.unpaginated) queryParams.append("unpaginated", "true");
  }

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiRequest<CustomersResponse>(
    `/customers${queryStr}`,
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