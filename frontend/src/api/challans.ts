import { apiRequest } from "./client";

import type {
  ChallanResponse,
  ChallansResponse,
  CreateChallanInput,
} from "../types/challan";

export const getChallans = () => {
  return apiRequest<ChallansResponse>(
    "/sales-challans",
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