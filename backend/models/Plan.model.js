import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    monthlyPriceINR: {
      type: Number,
      required: true,
    },
    monthlyPriceUSD: {
      type: Number,
      required: true,
    },
    monthlyPriceId: {
      type: String,
      required: true,
    },
    yearlyPriceINR: {
      type: Number,
      required: true,
    },
    yearlyPriceUSD: {
      type: Number,
      required: true,
    },
    yearlyPriceId: {
      type: String,
      required: true,
    },
    totalBytes: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
