import type { UserRole } from "../auth/auth.types.js";

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface ChangeUserPasswordData {
  password: string;
}