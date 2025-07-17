import { model, Schema } from "mongoose";
const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: Date.now,
      expires: 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true },
);

const Session = model("Session", sessionSchema);
export default Session;
