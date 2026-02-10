import mongoose from "mongoose";
import { PAYMENT_GETWAY, SUBSCRIPTION_STATUS } from "../constants/constant.js";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUS,
      default: "active",
    },
    stripeSubscriptionCycle: {
      type: [Object],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    stripeSubscriptionId: {
      type: String,
    },
    razorpaySubscriptionId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    isPauseCollection: {
      type: Boolean,
      default: false,
    },
    cancelDate: {
      type: Date,
    },
    customerId: {
      type: String,
    },
    paymentType: {
      type: String,
      enum: PAYMENT_GETWAY,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
