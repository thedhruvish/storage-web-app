import * as z from "zod";

export const createPromoCodeSchema = z.object({
  code: z.string().min(1, "Promo Code is required"),
  couponCode: z.string().min(1, "Coupon Code is required"),
  isActive: z.boolean(), // Default to active
  expires_at: z.date().optional(),
  customer: z.string().optional(),
  max_redemptions: z
    .number()
    .int("Must be a whole number")
    .positive("Must be greater than 0")
    .optional(),
});

export type PromoCodeFormValues = z.infer<typeof createPromoCodeSchema>;

export type PromoCode = {
  id: string;
  code: string;
  created: number;
  expires_at: number;
  max_redemptions: number;
  customer: string;
  promotion: {
    coupon: string;
    type: string;
  };
  restrictions: {
    first_time_transaction: boolean;
    minimum_amount: number;
    minimum_amount_currency: string;
  };
  times_redeemed: number;
  active: boolean;
};
