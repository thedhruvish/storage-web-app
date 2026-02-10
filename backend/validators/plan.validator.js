import z from "zod";

export const planCreateValidation = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(3, "Description must be at least 3 characters long"),
  monthlyPriceINR: z.number().min(1, "Monthly Price must be at least 1"),
  monthlyPriceUSD: z.number().min(1, "Monthly Price must be at least 1"),
  yearlyPriceINR: z.number().min(1, "Yearly Price must be at least 1"),
  yearlyPriceUSD: z.number().min(1, "Yearly Price must be at least 1"),
  totalBytes: z.number().min(1000, "Total bytes must be at least 1000"),
  isActive: z.boolean(),
});
