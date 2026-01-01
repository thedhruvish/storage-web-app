import { model, Schema } from "mongoose";
import { ROLE } from "../constants/role.js";
import { DEFAULT_STORAGE } from "../constants/constant.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    picture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Directory",
    },
    role: {
      type: String,
      enum: ROLE,
      default: "user",
    },
    maxStorageBytes: {
      type: Number,
      required: true,
      default: DEFAULT_STORAGE,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    dueDeleteDate: {
      type: Date,
      default: null,
    },
    twoFactor: {
      type: Schema.Types.ObjectId,
      ref: "TwoFa",
    },
    metaData: {
      type: Object,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
