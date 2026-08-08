import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().trim().min(2).max(150),
  location: z.string().trim().min(2),
});

export const updateWarehouseSchema =
  createWarehouseSchema.partial().extend({
    isActive: z.boolean().optional(),
  });