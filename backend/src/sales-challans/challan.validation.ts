import { z } from "zod";

const challanItemSchema = z.object({
  productId: z.string().uuid(),

  quantity: z
    .number()
    .int()
    .positive(),
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid(),

  items: z
    .array(challanItemSchema)
    .min(1),
});