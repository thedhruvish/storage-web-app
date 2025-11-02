import mongoose from "mongoose";
import ApiResponse from "../utils/ApiResponse.js";
import Plan from "../models/Plan.model.js";
import {
  createStripeProduct,
  deleteStripeProduct,
  disableStripeProduct,
} from "../utils/stripeHelper.js";

// handle the plances with stripe
export const getAllPlans = async (req, res) => {
  const plans = await Plan.find();
  res.status(200).json(new ApiResponse(200, "Plans list", { plans }));
};

export const createPlan = async (req, res) => {
  const {
    title,
    description,
    priceINR,
    priceUSD,
    interval,
    totalBytes,
    isActive,
  } = req.body;

  const planId = new mongoose.Types.ObjectId();
  // this is the helper func that create a stripe product
  const stripeProductPlan = await createStripeProduct({
    title,
    isActive,
    description,
    priceUSD,
    interval,
    metadata: {
      totalBytes,
      planId: planId.toString(),
    },
  });

  // plan save on the db
  await Plan.create({
    _id: planId,
    title,
    priceINR,
    description,
    interval,
    priceUSD,
    totalBytes,
    isActive,
    createBy: req.user._id,
    productId: stripeProductPlan.id,
    default_price_id: stripeProductPlan.default_price,
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
  const plan = await Plan.findByIdAndDelete(id);
  // now it now workingg delete for the stripe just delete for the mongo db.
  // await deleteStripeProduct(plan.productId, plan.default_price_id);
  res.status(200).json(new ApiResponse(200, "Plan delete Successfuly"));
};

export const getAllPlansForPublic = async (req, res) => {
  const plans = await Plan.find({ isActive: true });
  res.status(200).json(new ApiResponse(200, "Plans list", { plans }));
};
