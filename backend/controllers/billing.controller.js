import ApiResponse from "../utils/ApiResponse.js";
import {
  generateCheckoutUrl,
  getCouponsService,
  createCouponService,
  deleteCouponService,
  getPromoCodesService,
  createPromoCodeService,
  togglePromoCodeService,
} from "../services/billing.service.js";
import { createRazorpaySubscription } from "../services/razorpay.service.js";

// checkout
export const genratorStripeCheckoutUrl = async (req, res) => {
  const url = await generateCheckoutUrl({
    planId: req.body.id,
    user: req.user,
  });

  res.status(201).json(new ApiResponse(201, "checkout url created", { url }));
};

export const genratorRazorpayCheckout = async (req, res) => {
  const { billing, id } = req.body;

  const subscription = await createRazorpaySubscription({
    planId: id,
    billing,
    user: req.user,
  });
  console.log(subscription);
  res
    .status(201)
    .json(new ApiResponse(201, "checkout url created", subscription.id));
};

// coupons
export const getAllCoupons = async (req, res) => {
  const coupons = await getCouponsService();
  res.status(200).json(new ApiResponse(200, "Coupons list", { coupons }));
};

export const createCoupons = async (req, res) => {
  await createCouponService(req.body);
  res.status(200).json(new ApiResponse(200, "Coupons create Successfully"));
};

export const deleteCoupons = async (req, res) => {
  await deleteCouponService(req.params.id);
  res.status(200).json(new ApiResponse(200, "Coupons delete Successfully"));
};

// promo codes
export const getAllPromoCode = async (req, res) => {
  const promoCode = await getPromoCodesService();
  res.status(200).json(new ApiResponse(200, "promoCode list", { promoCode }));
};

export const createPromoCode = async (req, res) => {
  await createPromoCodeService({
    ...req.body,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, "promoCode create Successfully"));
};

export const togglePromoCode = async (req, res) => {
  await togglePromoCodeService(req.params.id, req.body.isActive);
  res.status(201).json(new ApiResponse(201, "promoCode toggle Successfully"));
};
