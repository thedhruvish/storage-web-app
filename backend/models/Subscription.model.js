import mongoose from "mongoose";

export const subscriptionSchema = new mongoose.Schema({
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
    enum: ["active", "cancelled", "paused", "expired"],
    default: "active",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  cancelDate: {
    type: Date,
  },
  paymentType: {
    type: String,
    enum: ["stripe", "razorpay"],
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
