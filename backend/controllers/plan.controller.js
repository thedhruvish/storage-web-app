import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";
import Plan from "../models/Plan.model.js";
import {
  createStripeProduct,
  createStripePrice,
  disableStripeProduct,
} from "../services/stripe.service.js";
import { createRazorpayPlan } from "../services/razorpay.service.js";

// handle the plances with stripe
export const getAllPlans = async (req, res) => {
  const plans = await Plan.find();
  res.status(200).json(new ApiResponse(200, "Plans list", { plans }));
};

export const createPlan = async (req, res) => {
  const {
    title,
    description,
    monthlyPriceINR,
    monthlyPriceUSD,
    yearlyPriceINR,
    yearlyPriceUSD,
    totalBytes,
    isActive,
  } = req.body;

  const planId = new mongoose.Types.ObjectId();
  const metadata = {
    totalBytes,
    planId: planId.toString(),
  };
  // 1. Create Stripe Product with Monthly Price as default
  const stripeProductPlanPromise = createStripeProduct({
    title,
    isActive,
    description,
    priceUSD: monthlyPriceUSD,
    interval: "month",
    metadata,
  });
  // Create Razorpay Monthly Plan (INR)
  const razorpayMonthlyPlanPromise = createRazorpayPlan({
    name: `${title} - Monthly`,
    description,
    amount: monthlyPriceINR,
    interval: "month",
    notes: metadata,
  });

  // Create Razorpay Yearly Plan (INR)
  const razorpayYearlyPlanPromise = createRazorpayPlan({
    name: `${title} - Yearly`,
    description,
    amount: yearlyPriceINR,
    interval: "year",
    notes: metadata,
  });

  const [stripeProductPlan, razorpayMonthlyPlan, razorpayYearlyPlan] =
    await Promise.all([
      stripeProductPlanPromise,
      razorpayMonthlyPlanPromise,
      razorpayYearlyPlanPromise,
    ]);

  // 2. Create Yearly Price in Stripe
  const stripeYearlyPrice = await createStripePrice({
    productId: stripeProductPlan.id,
    unit_amount: yearlyPriceUSD,
    interval: "year",
    metadata: {
      totalBytes,
      planId: planId.toString(),
    },
  });

  // Plan save on the db
  await Plan.create({
    _id: planId,
    title,
    description,
    totalBytes,
    isActive,
    createBy: req.user._id,
    productId: stripeProductPlan.id,

    // Monthly
    monthly: {
      priceINR: monthlyPriceINR,
      priceUSD: monthlyPriceUSD,
      stripeId: stripeProductPlan.default_price,
      razorpayId: razorpayMonthlyPlan.id,
    },

    // Yearly
    yearly: {
      priceINR: yearlyPriceINR,
      priceUSD: yearlyPriceUSD,
      stripeId: stripeYearlyPrice.id,
      razorpayId: razorpayYearlyPlan.id,
    },
  });

  res.status(201).json(new ApiResponse(201, "Plan create Successfuly"));
};

export const togglePlan = async (req, res) => {
  const { id } = req.params;
  const plan = await Plan.findByIdAndUpdate(
    id,
    [
      {
        $set: { isActive: { $not: ["$isActive"] } },
      },
    ],
    { new: true },
  );
  await disableStripeProduct(plan.productId, plan.isActive);
  res.status(200).json(new ApiResponse(200, "Plan toggle Successfuly"));
};

export const deletePlan = async (req, res) => {
  const { id } = req.params;
  await Plan.findByIdAndDelete(id);
  // now it now workingg delete for the stripe just delete for the mongo db.
  // await deleteStripeProduct(plan.productId, plan.default_price_id);
  res.status(200).json(new ApiResponse(200, "Plan delete Successfuly"));
};

export const getAllPlansForPublic = async (req, res) => {
  const plans = await Plan.find({ isActive: true }).select(
    "-createBy -createdAt -updatedAt -__v -isActive",
  );
  res.status(200).json(new ApiResponse(200, "Plans list", plans));
};
