import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { LOGIN_PROVIDER } from "./../constants/constant.js";

const authIdentitySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: LOGIN_PROVIDER,
      required: true,
    },
    providerEmail: {
      type: String,
      required: true,
    },

    providerId: {
      type: String, // for email provider it eamil other provider thay id like google sub id
      required: true,
    },

    // only for email provider
    passwordHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true },
);

/**
 * One provider account can belong to only one user
 * in this are the userId: 1 and providerId: 1 than userId: 2 and providerId: 1 -> it give error bcz alrey connected to another account.
 */
authIdentitySchema.index({ provider: 1, providerId: 1 }, { unique: true });

/**
 * Prevent duplicate providers per user
 * for example userId: 1 is provider by google after userId: 1 can't agin provider same
 */
authIdentitySchema.index({ userId: 1, provider: 1 }, { unique: true });

/**
 * monog hook to before the save data to covert into hash
 */
authIdentitySchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || !this.passwordHash) {
    return next();
  }
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

/**
 * compare password is valid or not
 */
authIdentitySchema.method("isValidPassword", async function (inputPassowrd) {
  return await bcrypt.compare(inputPassowrd, this.passwordHash);
});

const AuthIdentity = model("AuthIdentity", authIdentitySchema);
export default AuthIdentity;
