import { apiRequest } from "./client";

import type {
  ChangePasswordInput,
  CreateUserInput,
  UpdateUserInput,
  UserResponse,
  UsersResponse,
} from "../types/user";

export const getUsers = () => {
  return apiRequest<UsersResponse>(
    "/users",
  );
};

export const getUser = (
  id: string,
) => {
  return apiRequest<UserResponse>(
    `/users/${id}`,
  );
};

export const createUser = (
  data: CreateUserInput,
) => {
  return apiRequest<UserResponse>(
    "/users",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
};

export const updateUser = (
  id: string,
  data: UpdateUserInput,
) => {
  return apiRequest<UserResponse>(
    `/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};

export const changeUserPassword = (
  id: string,
  data: ChangePasswordInput,
) => {
  return apiRequest<UserResponse>(
    `/users/${id}/password`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
};