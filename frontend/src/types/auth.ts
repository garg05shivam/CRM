export const USER_ROLES = [
  "ADMIN",
  "SALES",
  "WAREHOUSE",
  "ACCOUNTS",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthenticatedUser;
    accessToken: string;
  };
}