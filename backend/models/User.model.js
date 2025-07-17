import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

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
    password: {
      type: String,
    },
    loginProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },
    picture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      ref: "Dir",
    },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "user"],
      default: "user",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// monog hook to before the save data to covert into hash
userSchema.pre("save", async function (next) {
  if (this.isModified(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// compare password is valid or not
userSchema.method("isValidPassword", async function (inputPassowrd) {
  return await bcrypt.compare(inputPassowrd, this.password);
});

const User = model("User", userSchema);

export default User;
