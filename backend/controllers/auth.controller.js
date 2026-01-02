import mongoose from "mongoose";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Directory from "../models/Directory.model.js";
import { OAuth2Client } from "google-auth-library";
import Otp from "../models/Otp.model.js";
import { sendOtpToMail } from "../services/mail.service.js";
import { createAndCheckLimitSession } from "../services/redis.service.js";
import redisClient from "../config/redis-client.js";
import { isValidTurnstileToken } from "../utils/TurnstileVerfication.js";
import AuthIdentity from "../models/AuthIdentity.model.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register user
export const registerWithEmail = async (req, res, next) => {
  const { name, email, password, turnstileToken } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  if (!(await isValidTurnstileToken(turnstileToken))) {
    return res
      .status(400)
      .json(new ApiError(400, "recaptcha is not valid try again"));
  }
  const isExstingEmail = await AuthIdentity.exists({
    providerId: normalizedEmail,
    provider: "EAMIL",
  });

  if (isExstingEmail) {
    return res.status(409).json(new ApiError(409, "Email Id Already Existing"));
  }

  //session Transtion
  const mongoSesssion = await mongoose.startSession();

  mongoSesssion.startTransaction();
  try {
    const dirId = new mongoose.Types.ObjectId();
    const user = new User({
      name,
      email: normalizedEmail,
      rootDirId: dirId,
      metaData: {
        showSetUp2Fa: true,
      },
    });
    const userPromise = user.save({ session: mongoSesssion });

    const rootDir = new Directory({
      _id: dirId,
      name: `root-${normalizedEmail}`,
      userId: user._id,
      parentDirId: null,
      metaData: { size: 0 },
    });

    const rootPromise = rootDir.save({ session: mongoSesssion });

    const newAuthIdentitySchema = new AuthIdentity({
      userId: user._id,
      provider: "EAMIL",
      providerEmail: normalizedEmail,
      providerId: normalizedEmail,
      passwordHash: password,
    });
    const newAuthPromise = newAuthIdentitySchema.save({
      session: mongoSesssion,
    });
    await Promise([userPromise, rootPromise, newAuthPromise]);
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

  const user = await User.findOne({ email }).populate({
    path: "twoFactorId",
    select: "+totp.secret",
  });

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

  // user enable to the two fa authentication:
  if (user?.twoFactorId?.isEnabled) {
    return res.status(200).json(
      new ApiResponse(200, "verify 2FA ", {
        isEnabled2Fa: true,
        isTotp: user.twoFactorId.totp?.isVerified === true ? true : false,
        isPasskey: user.twoFactorId.passkeys?.length !== 0 ? true : false,
        userId: user._id,
      }),
    );
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

  if (user?.metaData?.showSetUp2Fa) {
    await User.updateOne(
      { _id: user._id },
      {
        $unset: {
          "metaData.showSetUp2Fa": "",
        },
      },
    );
    return res.status(200).json(
      new ApiResponse(
        200,
        "User login Successfuly . and you can set the optionality to the 2 FA auth",
        {
          showSetUp2Fa: true,
        },
      ),
    );
  }
  res.status(200).json(
    new ApiResponse(200, "User login Successfuly", {
      is_verfiy_otp: false,
    }),
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
  res.clearCookie("sessionId", {
    httpOnly: true,
    secure: true,
    signed: true,
  });
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

  const { email, picture, name, sub } = await googleUser.getPayload();

  const exstingEmail = await AuthIdentity.findOne({
    providerId: sub,
    provider: "GOOGLE",
  }).populate({
    path: "userId",
    select: "_id isDeleted twoFactorId metaData",
    populate: {
      path: "twoFactorId",
      select: "_id totp isEnabled passkeys",
    },
  });
  //session Transtion
  const mongoSesssion = await mongoose.startSession();
  mongoSesssion.startTransaction();

  try {
    let userId;
    let showSetUp2Fa;
    if (exstingEmail) {
      // direct login
      if (exstingEmail.userId?.isDeleted) {
        return res
          .status(409)
          .json(
            new ApiError(409, "Your Account is Deleted. Please Contact Admin"),
          );
      }
      // verifiy 2FA
      userId = exstingEmail.userId._id;
      if (exstingEmail.userId?.twoFactorId?.isEnabled) {
        showSetUp2Fa = false;
        const twoFa = exstingEmail.userId?.twoFactorId;
        // do not gen a token just send which method to verify
        return res.status(200).json(
          new ApiResponse(200, "verify 2FA ", {
            isEnabled2Fa: true,
            isTotp: twoFa.totp?.isVerified === true ? true : false,
            isPasskey: twoFa.passkeys?.length !== 0 ? true : false,
            userId,
          }),
        );
      }
    } else {
      //  in the here register a new user.
      showSetUp2Fa = true;

      const normalizedEmail = email.toLowerCase().trim();

      const dirId = new mongoose.Types.ObjectId();
      const user = new User({
        name,
        email: normalizedEmail,
        rootDirId: dirId,
        picture,
      });
      userId = user._id;
      const userPromise = user.save({ session: mongoSesssion });

      const rootDir = new Directory({
        _id: dirId,
        name: `root-${normalizedEmail}`,
        userId,
        parentDirId: null,
        metaData: { size: 0 },
      });

      const rootPromise = rootDir.save({ session: mongoSesssion });

      const newAuthIdentitySchema = new AuthIdentity({
        userId,
        provider: "GOOGLE",
        providerEmail: normalizedEmail,
        providerId: sub,
      });
      const newAuthPromise = newAuthIdentitySchema.save({
        session: mongoSesssion,
      });

      await Promise([userPromise, rootPromise, newAuthPromise]);

      await mongoSesssion.commitTransaction();
    }

    const sessionId = await createAndCheckLimitSession(userId.toString());

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      signed: true,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "User login Successfuly . and you can set the optionality to the 2 FA auth",
        {
          showSetUp2Fa,
        },
      ),
    );
  } catch (error) {
    console.log(error);
    await mongoSesssion.abortTransaction();
    next(new ApiError(400, error.message));
  } finally {
    mongoSesssion.endSession();
  }
};

// login with github
export const loginWithGithub = async (req, res) => {
  const { hint = "LOGIN", userId = null } = req.body;
  // for support both login and link account
  const redirectUrl =
    hint === "LINK"
      ? `${process.env.BACKEND_URL}/auth/github/link?userId=${userId}`
      : process.env.GITHUB_REDIRECT_URI;

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Link create",
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=user:email`,
      ),
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

  if (!data.access_token) {
    throw new Error("GitHub OAuth failed");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = await userRes.json();

  const githubUserId = githubUser.id;
  const picture = githubUser.avatar_url;
  const githubUsername = githubUser.login;

  const exstingEmail = await AuthIdentity.findOne({
    providerId: githubUserId,
    provider: "GITHUB",
  }).populate({
    path: "userId",
    select: "_id isDeleted twoFactorId metaData",
    populate: {
      path: "twoFactorId",
      select: "_id totp isEnabled passkeys",
    },
  });
  let showSetUp2Fa;
  let queryParms;
  let userId;
  const mongoSesssion = await mongoose.startSession();
  mongoSesssion.startTransaction();
  try {
    if (exstingEmail) {
      showSetUp2Fa = false;
      // direct login
      if (exstingEmail.userId?.isDeleted) {
        const errorMessge = "Your Account is Deleted. Please Contact Admin";
        return res.redirect(
          `${process.env.FRONTEND_URL}/github?error=${errorMessge}`,
        );
      }
      userId = exstingEmail.userId;
      // verifiy 2FA
      if (exstingEmail.userId?.twoFactorId?.isEnabled) {
        userId = exstingEmail.userId._id;

        const twoFa = exstingEmail.userId?.twoFactorId;

        return res.redirect(
          `${process.env.FRONTEND_URL}/github?isEnabled2Fa=${true}&isTotp=${twoFa.totp?.isVerified === true ? true : false}&isPasskey=${twoFa.passkeys?.length !== 0 ? true : false}&userId=${userId}`,
        );
      }
    } else {
      //  in the here register a new user.
      //session Transtion

      const emailRes = await fetch("https://api.github.com/user/emails", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      const emailResData = await emailRes.json();

      const primaryEmail = emailResData.find(
        (e) => e.primary && e.verified,
      )?.email;

      const normalizedEmail = primaryEmail.toLowerCase().trim();

      const dirId = new mongoose.Types.ObjectId();
      const user = new User({
        githubUsername,
        email: normalizedEmail,
        rootDirId: dirId,
        picture,
      });
      userId = user._id;
      const userPromise = user.save({ session: mongoSesssion });

      const rootDir = new Directory({
        _id: dirId,
        name: `root-${normalizedEmail}`,
        userId: userId,
        parentDirId: null,
        metaData: { size: 0 },
      });

      const rootPromise = rootDir.save({ session: mongoSesssion });

      const newAuthIdentitySchema = new AuthIdentity({
        userId: userId,
        provider: "GITHUB",
        providerEmail: normalizedEmail,
        providerId: githubUserId,
      });

      const newAuthPromise = newAuthIdentitySchema.save({
        session: mongoSesssion,
      });

      await Promise([userPromise, rootPromise, newAuthPromise]);

      await mongoSesssion.commitTransaction();
    }
    const sessionId = await createAndCheckLimitSession(userId.toString());

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      signed: true,
    });
    queryParms = `showSetUp2Fa=${showSetUp2Fa}`;
  } catch (error) {
    console.log(error);
    await mongoSesssion.abortTransaction();
    queryParms = "error=something want wrong Try agin";
  } finally {
    mongoSesssion.endSession();
    res.redirect(`${process.env.FRONTEND_URL}/github?${queryParms}`);
  }

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
    return res.status(400).json(new ApiError(400, "Invalid otp or It Expired"));
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

export const connectWithGoogle = async (req, res) => {
  const userId = req.user._id;
  const { idToken } = req.body;

  const googleUser = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, sub } = await googleUser.getPayload();

  const exstingEmail = await AuthIdentity.exists({
    providerId: sub,
    provider: "GOOGLE",
  });
  if (exstingEmail) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "This email alredy link to anothr account. try other account",
        ),
      );
  }
  const normalizedEmail = email.toLowerCase().trim();
  const newAuthIdentity = new AuthIdentity({
    userId,
    provider: "GOOGLE",
    providerEmail: normalizedEmail,
    providerId: sub,
  });
  await newAuthIdentity.save();
  res
    .status(201)
    .json(new ApiResponse(201, "SuccessFully Link Google Account"));
};

export const connectWithGithub = async (req, res) => {
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

  if (!data.access_token) {
    throw new Error("GitHub OAuth failed");
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = await userRes.json();

  const githubUserId = githubUser.id;

  const exstingEmail = await AuthIdentity.exists({
    providerId: githubUserId,
    provider: "GITHUB",
  });
  if (exstingEmail) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "This email alredy link to anothr account. try other account",
        ),
      );
  }
  const emailRes = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });
  const emailResData = await emailRes.json();

  const normalizedEmail = emailResData
    .find((e) => e.primary && e.verified)
    ?.email?.toLowerCase()
    .trim();

  const newAuthIdentity = new AuthIdentity({
    userId,
    provider: "GITHUB",
    providerEmail: normalizedEmail,
    providerId: githubUserId,
  });
  await newAuthIdentity.save();
  res
    .status(201)
    .json(new ApiResponse(201, "SuccessFully Link Github Account"));
};

export const connectWithEmail = async (req, res) => {
  const { email } = req.body;
  const userId = req.user._id;

  const normalizedEmail = email.toLowerCase().trim();

  const exstingEmail = await AuthIdentity.exists({
    providerId: normalizedEmail,
  });
  if (exstingEmail) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "This email alredy link to anothr account. try other account",
        ),
      );
  }

  await sendOtpToMail(userId.toString());
  return res.status(200).json(
    new ApiResponse(200, "Verify the opt", {
      is_verfiy_otp: true,
      userId: userId,
    }),
  );
};

export const connectWithEmailVerifyOtp = async (req, res) => {
  const { otp, userId } = req.body;

  const optDoc = await Otp.findOne({ userId, otp });

  if (!optDoc) {
    return res.status(400).json(new ApiError(400, "Invalid otp or It Expired"));
  }
  // delete after verfiy otp
  await optDoc.deleteOne();
  res.status(201).json(new ApiResponse(201, "SuccessFully Link Email Account"));
};
