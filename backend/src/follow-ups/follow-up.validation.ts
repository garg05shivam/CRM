import { z } from "zod";

export const createFollowUpSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1)
    .max(2000),

  followUpDate: z
    .string()
    .date(),
});

export const updateFollowUpSchema =
  createFollowUpSchema.partial();