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