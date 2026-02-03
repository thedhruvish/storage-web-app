import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    monthly: {
      priceINR: {
        type: Number,
        required: true,
      },
      priceUSD: {
        type: Number,
        required: true,
      },
      stripeId: {
        type: String,
        required: true,
      },
      razorpayId: {
        type: String,
        required: true,
      },
    },
    yearly: {
      priceINR: {
        type: Number,
        required: true,
      },
      priceUSD: {
        type: Number,
        required: true,
      },
      stripeId: {
        type: String,
        required: true,
      },
      razorpayId: {
        type: String,
        required: true,
      },
    },
    features: {
      type: [String],
      default: [],
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
