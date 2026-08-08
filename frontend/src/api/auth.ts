import { apiRequest } from "./client";
import type { LoginResponse } from "../types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const loginApi = (
  credentials: LoginCredentials,
) => {
  return apiRequest<LoginResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
  );
};