import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Directory from "../models/Directory.model.js";
import { OAuth2Client } from "google-auth-library";
import Otp from "../models/Otp.model.js";
import { sendOtpToMail } from "../utils/mailsend.js";
import { createAndCheckLimitSession } from "../utils/redisHelper.js";
import redisClient from "../config/redis-client.js";
import { isValidTurnstileToken } from "../utils/TurnstileVerfication.js";
import { generateBackupCode, genTOTPUrl } from "../utils/twoStepVerfiy.js";
import { authenticator } from "otplib";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register user
export const registerWithEmail = async (req, res, next) => {
  const { name, email, password, turnstileToken } = req.body;

  if (!(await isValidTurnstileToken(turnstileToken))) {
    return res
      .status(400)
      .json(new ApiError(400, "recaptcha is not valid try again"));
  }

  const isExstingEmail = await User.findOne({ email });

  // check user delete by youself or admin
  if (isExstingEmail?.isDeleted) {
    return res
      .status(409)
      .json(new ApiError(409, "Your Account is Deleted. Please Contact Admin"));
  }

  //session Transtion
  const mongoSesssion = await mongoose.startSession();

  mongoSesssion.startTransaction();
  try {
    if (isExstingEmail) {
      throw new ApiError(400, "Email Id Already Existing");
    }
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
      parentDirId: null,
      metaData: { size: 0 },
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
  const { email, password, turnstileToken } = req.body;

  if (!(await isValidTurnstileToken(turnstileToken))) {
    return res
      .status(400)
      .json(new ApiError(400, "recaptcha is not valid try again"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email and password");
  }
  // check user delete by youself or admin
  if (user?.isDeleted) {
    return res
      .status(409)
      .json(new ApiError(409, "Your Account is Deleted. Please Contact Admin"));
  }
  // composer input password and db stora passowrd
  const isValidPWD = await user.isValidPassword(password);

  if (!isValidPWD) {
    throw new ApiError(401, "Invalid email and password");
  }
  // check if is_verfiy otp are the true than check the using opt
  if (process.env.IS_VERFIY_OTP == "true") {
    await sendOtpToMail(user._id.toString());
    return res.status(200).json(
      new ApiResponse(200, "Verify the opt", {
        is_verfiy_otp: true,
        userId: user._id,
      }),
    );
  }

  const sessionId = await createAndCheckLimitSession(user.id.toString());
  // delete password field in user obj
  delete user.password;
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User login Successfuly", { is_verfiy_otp: false }),
      user,
    );
};

// get user
export const getCureentUser = async (req, res) => {
  const metaData = await Directory.findById(req.user.rootDirId, {
    metaData: 1,
  });
  res.status(200).json(
    new ApiResponse(200, "User login Successfuly", {
      ...req.user,
      totalUsedBytes: metaData.metaData.size,
    }),
  );
};

// logout user
export const logout = async (req, res) => {
  const { sessionId } = req.signedCookies;
  await redisClient.del(`session:${sessionId}`);
  res.clearCookie("sessionId", { httpOnly: true, secure: true, signed: true });
  res.status(200).json(new ApiResponse(200, "User logout Successfuly"));
};

// logout all devices
export const logoutAllDevices = async (req, res) => {
  const { _id } = req.user;
  await createAndCheckLimitSession(_id, 0);
  res
    .status(200)
    .json(new ApiResponse(200, "User logout for all devices Successfuly"));
};

// login with google
export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;

  const googleUser = await googleClient.verifyIdToken({
    idToken,

    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, picture, name } = await googleUser.getPayload();

  //session Transtion
  const mongoSesssion = await mongoose.startSession();
  mongoSesssion.startTransaction();

  // check user is exsting
  let user = await User.findOne({ email });

  // check user delete by youself or admin
  if (user?.isDeleted) {
    return res
      .status(409)
      .json(new ApiError(409, "Your Account is Deleted. Please Contact Admin"));
  }

  let sessionId;

  try {
    if (user) {
      sessionId = await createAndCheckLimitSession(user.id.toString());
    } else {
      const dirId = new mongoose.Types.ObjectId();
      user = new User({
        name,
        email,
        rootDirId: dirId,
        picture,
        loginProvider: "google",
      });
      await user.save({ session: mongoSesssion });

      const rootDir = new Directory({
        _id: dirId,
        name: `root-${email}`,
        userId: user._id,
        parentDirId: null,
        metaData: { size: 0 },
      });
      await rootDir.save({ session: mongoSesssion });
      sessionId = await createAndCheckLimitSession(user.id.toString());

      // await session.save({ session: mongoSesssion });
    }

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      signed: true,
    });
    await mongoSesssion.commitTransaction();
    res.status(200).json(new ApiResponse(200, "User login Successfuly", user));
  } catch (error) {
    await mongoSesssion.abortTransaction();
    return res.status(500).json(new ApiError(500, error.message));
  } finally {
    mongoSesssion.endSession();
  }
};

// login with github
export const loginWithGithub = async (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`,
  );
};

// callback github
export const callbackGithub = async (req, res) => {
  const { code } = req.query;
  const resGithub = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
      code,
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const data = await resGithub.json();
  const emailRes = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      Authorization: `Bearer  ${data.access_token}`,
    },
  });
  const emailResData = await emailRes.json();

  const primaryEmail = emailResData.find((e) => e.primary && e.verified)?.email;

  let user = await User.findOne({ email: primaryEmail });

  // check user delete by youself or admin
  if (user?.isDeleted) {
    return res
      .status(409)
      .json(new ApiError(409, "Your Account is Deleted. Please Contact Admin"));
  }

  let sessionId;
  if (user) {
    sessionId = await createAndCheckLimitSession(user.id.toString());
  } else {
    const userRes = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer  ${data.access_token}`,
      },
    });
    const userResData = await userRes.json();
    const userId = new mongoose.Types.ObjectId();
    const body = {
      name: `root-${primaryEmail}`,
      parentDirId: null,
      userId,
      metaData: { size: 0 },
    };
    const rootDir = await Directory.create([body]);
    user = await User.create({
      _id: userId,
      email: primaryEmail,
      name: userResData.login,
      picture: userResData.avatar_url,
      isLogInByGoogle: "github",
      rootDirId: rootDir[0]._id,
    });
    sessionId = await createAndCheckLimitSession(user.id.toString());
  }
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });

  res.redirect(process.env.FRONTEND_URL);
  // process.env.FRONTEND_URL + "/github/session?sessionId=" + session.id,
};

// login with github for the set cookie
export const githubCookieSet = async (req, res) => {
  const { sessionId } = req.query;
  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });
  res.redirect(process.env.FRONTEND_URL);
};

// verify the otp
export const verfiyOtp = async (req, res) => {
  const { otp, userId } = req.body;

  const optDoc = await Otp.findOne({ userId, otp });

  if (!optDoc) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Invalid otp or It Expired"));
  }
  // delete after verfiy otp
  await optDoc.deleteOne();

  // genrate session
  const sessionId = await createAndCheckLimitSession(userId);

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });
  res.status(200).json(new ApiResponse(200, "User login Successfuly"));
};

// re-send otp
export const reSendOtp = async (req, res) => {
  const { userId } = req.body;
  // delete exsting user Otp
  await sendOtpToMail(userId);

  res.status(200).json(
    new ApiResponse(200, "OTP resend successfully", {
      is_verfiy_otp: true,
      userId: userId,
    }),
  );
};

// 2fa setup
export const twoFASetup = async (req, res) => {
  const { method } = req.body;
  let resData;
  if (method === "totp") {
    resData = genTOTPUrl(req.user.email);
    const newdata = await User.findByIdAndUpdate(req.user._id, {
      "twoFactor.totp.secret": resData.secret,
      "twoFactor.totp.isVerified": false,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, "two setup successfuly generator", resData));
  } else if (method === "passkeys") {
    // passkey logic
  } else {
    res.status(401).json(new ApiError(401, "this is not allowed."));
  }
};

export const intiVerfiyTotp = async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select(
    "+twoFactor.totp.secret",
  );
  if (!user || !user.twoFactor?.totp?.secret) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "2FA setup not initiated. Please generate a QR code first.",
        ),
      );
  }

  const isValidTotp = authenticator.verify({
    secret: user.twoFactor.totp.secret,
    token,
  });

  if (!isValidTotp) {
    return res
      .status(401)
      .json(new ApiError(401, "Your Token is expiry or invalid"));
  }
  const { hashedCodes, plainTextCodes } = await generateBackupCode();
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      "twoFactor.totp.isVerified": true,
      "twoFactor.isEnabled": true,
      "twoFactor.recoveryCodes": hashedCodes,
    },
  });
  res.status(200).json(
    new ApiResponse(200, "2FA Enabled Successfully", {
      verified: true,
      recoveryCodes: plainTextCodes,
      message:
        "Please save these recovery codes safely. You will not see them again.",
    }),
  );
};
