import Plan from "../models/Plan.model.js";
import ApiError from "../utils/ApiError.js";
import {
  countUserCheckoutUrls,
  createCheckoutUrl,
  getRedisValue,
} from "./redis.service.js";
import {
  createStripeCheckoutSession,
  createStripeCoupons,
  createStripePromotionCode,
  deleteStripeCoupons,
  listStripeCoupons,
  listStripePromotionCodes,
  toggleStripePromotionCodes,
} from "./stripe.service.js";

// checkout
export const generateCheckoutUrl = async ({ planId, user }) => {
  const userId = user._id.toString();

  const count = await countUserCheckoutUrls(userId);
  if (count >= 5) {
    throw new ApiError(
      400,
      "Please wait for some time before creating another checkout URL",
    );
  }

  const cacheKey = `checkoutUrl:${userId}:${planId}`;
  const cachedUrl = await getRedisValue(cacheKey);
  if (cachedUrl) return cachedUrl;

  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  const checkout = await createStripeCheckoutSession({
    priceId: plan.default_price_id,
    customer_email: user.email,
    metadata: {
      planId: plan._id.toString(),
      totalBytes: plan.totalBytes,
      userId,
    },
  });
  await createCheckoutUrl(userId, planId, checkout.url);

  return checkout.url;
};

// coupons
export const getCouponsService = async () => {
  const coupons = await listStripeCoupons();
  return coupons.data.map(
    ({ id, amount_off, created, duration, max_redemptions, percent_off }) => ({
      id,
      amount_off,
      created,
      duration,
      max_redemptions,
      percent_off,
    }),
  );
};

export const createCouponService = async ({
  code,
  amount_off,
  percent_off,
}) => {
  return createStripeCoupons({
    id: code,
    amount_off,
    percent_off,
  });
};

export const deleteCouponService = async (id) => {
  return deleteStripeCoupons(id);
};

// promo codes
export const getPromoCodesService = async () => {
  const promoCodes = await listStripePromotionCodes();
  return promoCodes.data;
};

export const createPromoCodeService = async ({
  code,
  couponCode,
  isActive,
  expires_at,
  customer,
  max_redemptions,
  userId,
}) => {
  return createStripePromotionCode({
    code,
    couponCode,
    isActive,
    expires_at,
    customer,
    max_redemptions,
    metadata: { userby: userId },
  });
};

export const togglePromoCodeService = async (id, isActive) => {
  return toggleStripePromotionCodes(id, isActive);
};
