import mongoose from "mongoose";

const webHookLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["stripe", "razorpay"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90, // 90 days
  },
});

const WebHookLog = mongoose.model("WebHookLog", webHookLogSchema);
export default WebHookLog;
