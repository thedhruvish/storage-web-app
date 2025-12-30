import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export const LOGIN_PROVIDER = ["password", "google", "github"];

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    googleEmail: {
      type: String,
      lowercase: true,
    },
    githubEmail: {
      type: String,
      lowercase: true,
    },
    password: {
      type: String,
    },
    loginProvider: {
      type: [String],
      enum: LOGIN_PROVIDER,
      default: "password",
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
      enum: ["owner", "admin", "manager", "user"],
      default: "user",
    },
    maxStorageBytes: {
      type: Number,
      required: true,
      default: 1024 ** 3,
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

// monog hook to before the save data to covert into hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// compare password is valid or not
userSchema.method("isValidPassword", async function (inputPassowrd) {
  return await bcrypt.compare(inputPassowrd, this.password);
});

const User = model("User", userSchema);

export default User;
