import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),

  quantity: z
    .number()
    .int()
    .positive(),

  movementType: z.enum(["IN", "OUT"]),

  reason: z
    .string()
    .trim()
    .min(1)
    .max(255),
});