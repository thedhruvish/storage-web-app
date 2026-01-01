import z from "zod";

export const createCouponsValidation = z.object({
  code: z.string("Coupon Code is required"),
  amount_off: z.number("Amount off is required").optional(),
  percent_off: z
    .number("Percent off is required")
    .min(1, "Percent off must be at least 1")
    .max(100, "Percent off must be at most 100")
    .optional(),
});

export const createPromoCodeValidation = z.object({
  code: z.string("Promo Code is required"),
  couponCode: z.string("Coupon Code is required"),
  isActive: z.boolean(),
  expries_at: z.number("Expiry Date is required").optional(),
  customer: z.string("Customer is required").optional(),
  max_redemptions: z.number("Max Redemptions is required").optional(),
});

export const togglePromoCodeValidation = z.object({
  isActive: z.boolean(),
});

export const idValidation = z.object({
  id: z.string("ID is required"),
});
