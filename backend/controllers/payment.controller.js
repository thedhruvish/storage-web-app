import Plan from "../models/Plan.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createStripeCheckoutSession,
  createStripeCoupons,
  createStripePromotionCode,
  deleteStripeCoupons,
  deleteStripePromotionCodes,
  listStripeCoupons,
  listStripePromotionCodes,
  toggleStripePromotionCodes,
} from "../utils/stripeHelper.js";
import redisClient from "../config/redis-client.js";

// checkout

export const genratorStripeCheckoutUrl = async (req, res) => {
  const { id } = req.body;
  const userId = req.user._id.toString();
  const checkoutUrl = await redisClient.get(`checkoutUrl:${userId}:${id}`);
  console.log(checkoutUrl);
  if (checkoutUrl) {
    return res
      .status(200)
      .json(new ApiResponse(200, "checkout url created", { url: checkoutUrl }));
  }
  const plan = await Plan.findById(id);

  const checkoutStripe = await createStripeCheckoutSession({
    priceId: plan.default_price_id,
    metadata: {
      planId: plan._id.toString(),
      totalBytes: plan.totalBytes,
      userId,
    },
    customer_email: req.user.email,
  });
  await redisClient.set(`checkoutUrl:${userId}:${id}`, checkoutStripe.url, {
    expiration: {
      type: "EX",
      value: 3600,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, "checkout url created", { url: checkoutStripe.url }),
    );
};

// handle the coupons
export const getAllCoupons = async (req, res) => {
  const coupons = await listStripeCoupons();
  const response = coupons.data.map(
    ({ id, amount_off, created, duration, max_redemptions, percent_off }) => ({
      id,
      amount_off,
      created,
      duration,
      max_redemptions,
      percent_off,
    }),
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Coupons list", { coupons: response }));
};

export const createCoupons = async (req, res) => {
  const { code, amount_off = undefined, percent_off = undefined } = req.body;
  await createStripeCoupons({ id: code, amount_off, percent_off });
  res.status(200).json(new ApiResponse(200, "Coupons create Successfuly"));
};

export const deleteCoupons = async (req, res) => {
  const { id } = req.params;
  await deleteStripeCoupons(id);
};

// handle promo code
export const getAllPromoCode = async (req, res) => {
  const promoCode = await listStripePromotionCodes();
  res
    .status(200)
    .json(
      new ApiResponse(200, "promoCode list", { promoCode: promoCode.data }),
    );
};

export const createPromoCode = async (req, res) => {
  const {
    code,
    couponCode,
    isActive,
    expires_at = undefined,
    customer = undefined,
    max_redemptions = undefined,
  } = req.body;

  await createStripePromotionCode({
    code,
    couponCode,
    isActive,
    customer,
    expires_at,
    max_redemptions,
    metadata: {
      userby: req.user._id,
    },
  });

  res.status(200).json(new ApiResponse(200, "promoCode create Successfuly"));
};
export const togglePromoCode = async (req, res) => {
  const { id } = req.params;
  const { isActive = false } = req.body;
  await toggleStripePromotionCodes(id, isActive);
  res.status(201).json(new ApiResponse(201, "promoCode toggle Successfuly"));
};
export const deletePromoCode = async (req, res) => {
  const { id } = req.params;
  await deleteStripePromotionCodes(id);
  res.status(201).json(new ApiResponse(201, "promoCode delete Successfuly"));
};
