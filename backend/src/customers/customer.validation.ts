import { z } from "zod";

export const createCustomerSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2)
    .max(150),

  mobileNumber: z
    .string()
    .trim()
    .min(7)
    .max(20),

  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .optional()
    .or(z.literal("")),

  businessName: z
    .string()
    .trim()
    .min(2)
    .max(200),

  gstNumber: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal("")),

  customerType: z.enum([
    "RETAIL",
    "WHOLESALE",
    "DISTRIBUTOR",
  ]),

  address: z
    .string()
    .trim()
    .min(5)
    .max(1000),

  status: z
    .enum([
      "LEAD",
      "ACTIVE",
      "INACTIVE",
    ])
    .optional(),

  followUpDate: z
    .string()
    .date()
    .optional()
    .or(z.literal("")),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();