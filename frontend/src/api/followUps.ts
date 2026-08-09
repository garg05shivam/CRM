import { apiRequest } from "./client";

import type {
  FollowUpInput,
  FollowUpResponse,
  FollowUpsResponse,
  DeleteFollowUpResponse,
} from "../types/followUp";

export const getCustomerFollowUps = (
  customerId: string,
) => {
  return apiRequest<FollowUpsResponse>(
    `/customers/${customerId}/follow-ups`,
  );
};

export const getAllFollowUps = (
  search?: string,
  date?: string,
) => {
  const params = new URLSearchParams();
  if (search?.trim()) params.append("search", search.trim());
  if (date?.trim()) params.append("date", date.trim());
  const queryString = params.toString() ? `?${params.toString()}` : "";

  return apiRequest<FollowUpsResponse>(
    `/follow-ups${queryString}`,
  );
};

export const createFollowUp = (
  customerId: string,
  data: FollowUpInput,
) => {
  return apiRequest<FollowUpResponse>(
    `/customers/${customerId}/follow-ups`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const updateFollowUp = (
  id: string,
  data: Partial<FollowUpInput>,
) => {
  return apiRequest<FollowUpResponse>(
    `/follow-ups/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

export const deleteFollowUp = (
  id: string,
) => {
  return apiRequest<DeleteFollowUpResponse>(
    `/follow-ups/${id}`,
    {
      method: "DELETE",
    },
  );
};