import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// register user
export const registerWithEmail = async (req, res) => {
  const { name, email, password } = req.body;
  if (!(name || email || password)) {
    throw new ApiError(400, "name,email and password is required");
  }
  const isExstingEmail = await User.exists({ email });

  if (isExstingEmail) {
    throw new ApiError(400, "Email Id Already Existing");
  }
  const dirId = new mongoose.Types.ObjectId();
  await User.create({
    name,
    email,
    password,
    rootDirId: dirId,
  });
  res.status(201).json(new ApiResponse(201, "User Successfuly Register"));
};

// login user
export const loginWithEmail = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email and password");
  }
  // composer input password and db stora passowrd
  const isValidPWD = await user.isValidPassword(password);

  if (!isValidPWD) {
    throw new ApiError(401, "Invalid email and password");
  }

  // delete password field in user obj
  delete user.password;

  res.status(200).json(new ApiResponse(200, "User login Successfuly"), user);
};

// login with google

// login with github
