import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Directory from "../models/Directory.model.js";
import Session from "../models/Session.model.js";

// register user
export const registerWithEmail = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, "name,email and password is required");
  }
  const isExstingEmail = await User.exists({ email });

  //session Transtion
  const mongoSesssion = await mongoose.startSession();
  try {
    if (isExstingEmail) {
      throw new ApiError(400, "Email Id Already Existing");
    }
    mongoSesssion.startTransaction();
    const dirId = new mongoose.Types.ObjectId();
    const user = new User({
      name,
      email,
      password,
      rootDirId: dirId,
    });
    await user.save({ session: mongoSesssion });

    const rootDir = new Directory({
      _id: dirId,
      name: `root-${email}`,
      userId: user._id.toString(),
      parentDirId: dirId,
    });
    await rootDir.save({ session: mongoSesssion });

    await mongoSesssion.commitTransaction();
    res.status(201).json(new ApiResponse(201, "User Successfuly Register"));
  } catch (error) {
    console.log(error);
    await mongoSesssion.abortTransaction();
    next(new ApiError(400, error.message));
  } finally {
    mongoSesssion.endSession();
  }
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

  // create a session
  const session = await Session.create({ userId: user._id });

  // delete password field in user obj
  delete user.password;

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });

  res.status(200).json(new ApiResponse(200, "User login Successfuly"), user);
};

// get user
export const getCureentUser = async (req, res) => {
  const { sessionId } = req.signedCookies;
  const session = await Session.findById(sessionId);
  const user = await User.findById(session.userId).select({
    name: 1,
    email: 1,
    pictur: 1,
    rootDirId: 1,
    role: 1,
  });
  res.status(200).json(new ApiResponse(200, "User login Successfuly", user));
};

// logout user
export const logout = async (req, res) => {
  const { sessionId } = req.signedCookies;
  await Session.findByIdAndDelete(sessionId);
  res.clearCookie("sessionId", { httpOnly: true, secure: true, signed: true });
  res.status(200).json(new ApiResponse(200, "User logout Successfuly"));
};

// logout all devices
export const logoutAllDevices = async (req, res) => {
  const { _id } = req.user;
  await Session.deleteMany({ userId: _id });
  res
    .status(200)
    .json(new ApiResponse(200, "User logout for all devices Successfuly"));
};

// login with google

// login with github
