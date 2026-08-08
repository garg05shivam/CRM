import { z } from "zod";

export const createProductSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(2)
    .max(200),

  sku: z
    .string()
    .trim()
    .min(1)
    .max(100),

  category: z
    .string()
    .trim()
    .min(1)
    .max(100),

  unitPrice: z
    .number()
    .nonnegative(),

  minimumStockQuantity: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  warehouseId: z
    .string()
    .uuid(),
});

export const updateProductSchema =
  createProductSchema.partial().extend({
    isActive: z.boolean().optional(),
  });