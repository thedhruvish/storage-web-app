import mongoose, { Schema } from "mongoose";

const sessionHistorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    device: {
      type: Object,
    },
    ipAddress: String,
    location: {
      city: String,
      regionName: String,
      countryName: String,
      countryCode: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 60, // Auto-delete history after 60 days
    },
  },
  { timestamps: true },
);

const SessionHistory = mongoose.model("SessionHistory", sessionHistorySchema);

export default SessionHistory;
