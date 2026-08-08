import { z } from "zod";

const userRoles = [
  "ADMIN",
  "SALES",
  "WAREHOUSE",
  "ACCOUNTS",
] as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),

  role: z.enum(userRoles),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(255)
    .optional(),

  role: z
    .enum(userRoles)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export const changeUserPasswordSchema =
  z.object({
    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters",
      )
      .max(
        128,
        "Password must not exceed 128 characters",
      ),
  });