import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    priceINR: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    productId: {
      type: String, // this id is the same as the created product on the stripe
    },
    paymentId: {
      type: String,
      required: true,
    },
    interval: {
      type: String,
      enum: ["month", "year"],
    },
    priceUSD: {
      type: Number,
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
