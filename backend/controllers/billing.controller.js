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
import {
  createRazorpaySubscription,
  retrieveRazorpaySubscription,
  verifyRazorpaySignature,
} from "../services/razorpay.service.js";
import User from "../models/User.model.js";
import Subscription from "../models/Subscription.model.js";
import { deleteRedisKey } from "../services/redis.service.js";
import Plan from "../models/Plan.model.js";
import ApiError from "../utils/ApiError.js";

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
  res
    .status(201)
    .json(new ApiResponse(201, "checkout url created", subscription.id));
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    req.body;

  const isValid = verifyRazorpaySignature(
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  );

  if (!isValid) {
    throw new ApiError(400, "Invalid signature");
  }

  const subscription = await retrieveRazorpaySubscription(
    razorpay_subscription_id,
  );

  if (!subscription) {
    throw new ApiError(400, "Subscription not found");
  }

  const { planId, userId, billing } = subscription.notes;

  await deleteRedisKey(`user:${userId}`);

  // Get plan details for totalBytes
  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, "Plan not found");

  // Create Subscription in DB
  await Subscription.create({
    planId: planId,
    userId: userId,
    startDate: new Date(subscription.current_start * 1000),
    endDate: new Date(subscription.current_end * 1000),
    razorpaySubscriptionId: razorpay_subscription_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status: "partial_active",
    paymentType: "razorpay",
    isPauseCollection: false,
    isActive: true,
  });

  // Update User
  await User.findByIdAndUpdate(userId, {
    $inc: {
      maxStorageBytes: plan.totalBytes,
    },
    dueDeleteDate: null,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Subscription verified and active"));
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
