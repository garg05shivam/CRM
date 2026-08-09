import { apiRequest } from "./client";

import type {
  ChallanResponse,
  ChallansResponse,
  CreateChallanInput,
} from "../types/challan";

export interface GetChallansParams {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  unpaginated?: boolean;
}

export const getChallans = (params?: GetChallansParams) => {
  const queryParams = new URLSearchParams();

  if (params) {
    if (params.search?.trim()) queryParams.append("search", params.search.trim());
    if (params.status) queryParams.append("status", params.status);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.page) queryParams.append("page", String(params.page));
    if (params.limit) queryParams.append("limit", String(params.limit));
    if (params.unpaginated) queryParams.append("unpaginated", "true");
  }

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return apiRequest<ChallansResponse>(
    `/sales-challans${queryStr}`,
  );
};

export const getChallan = (id: string) => {
  return apiRequest<ChallanResponse>(
    `/sales-challans/${id}`,
  );
};

export const createChallan = (
  data: CreateChallanInput,
) => {
  return apiRequest<ChallanResponse>(
    "/sales-challans",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const confirmChallan = (id: string) => {
  return apiRequest<ChallanResponse>(
    `/sales-challans/${id}/confirm`,
    {
      method: "POST",
    },
  );
};

export const cancelChallan = (id: string) => {
  return apiRequest<ChallanResponse>(
    `/sales-challans/${id}/cancel`,
    {
      method: "POST",
    },
  );
};