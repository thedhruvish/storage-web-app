import z from "zod";

export const planCreateValidation = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  priceINR: z.number().min(1, "Price must be at least 1"),
  priceUSD: z.number().min(1, "Price must be at least 1"),
  interval: z.enum(["month", "year"]),
  totalBytes: z.number().min(1000, "Total bytes must be at least 1000"),
  isActive: z.boolean(),
});
