import * as z from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  amount_off: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number (e.g., cents)")
    .positive("Amount must be positive")
    .optional(),
  percent_off: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Percent must be at least 1")
    .max(100, "Percent must be at most 100")
    .optional(),
});

export type CouponFormValues = z.infer<typeof createCouponSchema>;

export type Coupon = {
  id: string;
  amount_off: number;
  created: number;
  duration: string;
  max_redemptions: number;
  percent_off: number;
};
