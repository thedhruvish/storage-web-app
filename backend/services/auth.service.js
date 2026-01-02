import mongoose from "mongoose";
import User from "../models/User.model.js";
import Directory from "../models/Directory.model.js";
import AuthIdentity from "../models/AuthIdentity.model.js";
import ApiError from "../utils/ApiError.js";
import { validTurnstileToken } from "../utils/TurnstileVerfication.js";
import {
  createAuthIdentity,
  exstingAuthIdentity,
} from "./authIdentity.service.js";
import { createAndCheckLimitSession } from "./redis.service.js";
import { sendOtpToMail } from "./mail.service.js";

export const registerWithEmailService = async ({
  name,
  email,
  password,
  turnstileToken,
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  await validTurnstileToken(turnstileToken);

  await exstingAuthIdentity({
    provider: "EMAIL",
    providerId: normalizedEmail,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const dirId = new mongoose.Types.ObjectId();

    const user = await User.create(
      [
        {
          name,
          email: normalizedEmail,
          rootDirId: dirId,
          metaData: { showSetUp2Fa: true },
        },
      ],
      { session },
    );

    await Directory.create(
      [
        {
          _id: dirId,
          name: `root-${normalizedEmail}`,
          userId: user[0]._id,
          parentDirId: null,
          metaData: { size: 0 },
        },
      ],
      { session },
    );

    await AuthIdentity.create(
      [
        {
          userId: user[0]._id,
          provider: "EMAIL",
          providerEmail: normalizedEmail,
          providerId: normalizedEmail,
          passwordHash: password,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    return user[0];
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const loginWithEmailService = async ({
  email,
  password,
  turnstileToken,
}) => {
  await validTurnstileToken(turnstileToken);

  const user = await User.findOne({ email }).populate({
    path: "twoFactorId",
    select: "+totp.secret",
  });

  if (!user) throw new ApiError(401, "Invalid email or password");
  if (user.isDeleted) throw new ApiError(409, "Account deleted. Contact admin");

  const isValidPwd = await user.isValidPassword(password);
  if (!isValidPwd) throw new ApiError(401, "Invalid email or password");

  // 2FA flow
  if (user.twoFactorId?.isEnabled) {
    return {
      step: "2FA",
      data: {
        isTotp: !!user.twoFactorId.totp?.isVerified,
        isPasskey: user.twoFactorId.passkeys?.length > 0,
        userId: user._id,
      },
    };
  }

  // OTP flow
  if (process.env.IS_VERFIY_OTP === "true") {
    await sendOtpToMail(user._id.toString());
    return { step: "OTP", userId: user._id };
  }

  const sessionId = await createAndCheckLimitSession(user._id.toString());

  return {
    step: "LOGIN",
    sessionId,
    showSetUp2Fa: user.metaData?.showSetUp2Fa === true,
    userId: user._id,
  };
};

export const googleIdTokenVerify = async (idToken) => {
  const googleUser = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return await googleUser.getPayload();
};

export const createNewUser = async (userData, providerId, provider) => {
  const mongoSesssion = await mongoose.startSession();
  let userId = null;
  mongoSesssion.startTransaction();
  try {
    const dirId = new mongoose.Types.ObjectId();

    const user = new User({ ...userData, rootDirId: dirId });
    userId = user._id;

    const userPromise = user.save({ session: mongoSesssion });

    const rootDir = new Directory({
      _id: dirId,
      name: `root-${user.email}`,
      userId,
      parentDirId: null,
      metaData: { size: 0 },
    });

    const rootPromise = rootDir.save({ session: mongoSesssion });

    const newAuthPromise = createAuthIdentity(
      {
        userId,
        provider,
        providerEmail: user.email,
        providerId,
      },
      mongoSesssion,
    );

    await Promise([userPromise, rootPromise, newAuthPromise]);

    await mongoSesssion.commitTransaction();
  } catch (error) {
    console.log(error);
    await mongoSesssion.abortTransaction();
    next(new ApiError(400, error.message));
  } finally {
    mongoSesssion.endSession();
    return userId;
  }
};

export const getGithubUserDetails = async (code) => {
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
      Authorization: `Bearer ${githubAccessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = await userRes.json();

  const picture = githubUser.avatar_url;
  const githubUsername = githubUser.login;
  return {
    accessToken: data.access_token,
    picture,
    name: githubUsername,
    providerId: githubUser.id,
  };
};

export const getGithubUserEmail = async (AccessToken) => {
  const emailRes = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${AccessToken}`,
    },
  });
  const emailResData = await emailRes.json();
  return emailResData
    .find((e) => e.primary && e.verified)
    ?.email?.toLowerCase()
    .trim();
};
