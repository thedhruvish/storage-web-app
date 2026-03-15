import mongoose from "mongoose";
import User from "../models/User.model.js";
import Directory from "../models/Directory.model.js";
import ApiError from "../utils/ApiError.js";
import { validTurnstileToken } from "../utils/TurnstileVerfication.js";
import {
  createAuthIdentity,
  exstingAuthIdentity,
  getOneAuthIdentity,
} from "./authIdentity.service.js";
import { createAndCheckLimitSession, deleteRedisKey } from "./redis.service.js";
import { sendOtpToMail, verifyMailOTP } from "./mail.service.js";
import { googleClient } from "../lib/google.client.js";
import { LOGIN_PROVIDER } from "../constants/constant.js";
import AuthIdentity from "../models/AuthIdentity.model.js";
import { twoFaOnBoarding } from "./twofa.service.js";

export const registerWithEmailService = async ({
  name,
  email,
  password,
  turnstileToken,
}) => {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = new mongoose.Types.ObjectId();
  if (!req.isMobile) {
    await validTurnstileToken(turnstileToken);
  }
  await exstingAuthIdentity({
    provider: LOGIN_PROVIDER[0],
    providerId: normalizedEmail,
  });
  await Promise.all([
    createNewUser(
      {
        _id: userId,
        name,
        email: normalizedEmail,
        metaData: { showSetUp2Fa: true, isPendingVerification: true },
      },
      normalizedEmail,
      LOGIN_PROVIDER[0],
      password,
    ),
    sendOtpToMail(userId.toString(), normalizedEmail),
  ]);
  return userId;
};

export const loginWithEmailService = async (req) => {
  const { email, password, turnstileToken } = req.body;
  if (!req.isMobile) {
    await validTurnstileToken(turnstileToken);
  }
  const authIdentity = await getOneAuthIdentity({
    providerEmail: email,
    provider: LOGIN_PROVIDER[0],
  });

  if (!authIdentity) throw new ApiError(401, "Invalidss email or password");
  if (authIdentity.userId.isDeleted)
    throw new ApiError(409, "Account deleted. Contact admin");

  const isValidPwd = await authIdentity.isValidPassword(password);
  if (!isValidPwd) throw new ApiError(401, "Invalids email or password");

  if (authIdentity.userId?.metaData?.isPendingVerification) {
    await sendOtpToMail(authIdentity.userId._id.toString(), email);
    return { step: "OTP", userId: authIdentity.userId._id };
  }

  // 2FA flow
  return await twoFaOnBoarding(req, authIdentity.userId);
};

export const googleIdTokenVerify = async (idToken) => {
  const googleUser = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const playload = await googleUser.getPayload();
  if (!playload) {
    throw new ApiError(400, "Do not get the information on from the google");
  }
  return playload;
};

export const createNewUser = async (
  userData,
  providerId,
  provider,
  passwordHash,
) => {
  const session = await mongoose.startSession();
  let userId;

  try {
    await session.withTransaction(async () => {
      const dirId = new mongoose.Types.ObjectId();

      const user = new User({ ...userData, rootDirId: dirId });
      userId = user._id;

      const rootDir = new Directory({
        _id: dirId,
        name: `root-${user.email}`,
        userId,
        parentDirId: null,
        metaData: { size: 0 },
      });

      await Promise.all([
        user.save({ session }),
        rootDir.save({ session }),
        createAuthIdentity(
          {
            userId,
            provider,
            providerEmail: user.email,
            providerId,
            passwordHash,
          },
          session,
        ),
      ]);
    });

    return userId;
  } catch (error) {
    throw new ApiError(400, error.message);
  } finally {
    session.endSession();
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

/**
 *
 *  account connect
 */
export const accConnectGoogle = async (userSession, idToken) => {
  const { tokens } = await googleClient.getToken(idToken);
  if (!tokens) {
    throw new ApiError(400, "Try agin");
  }
  console.log(JSON.stringify(tokens, null, 2));
  const { sub, email } = await googleIdTokenVerify(tokens.id_token);
  console.log({ sub, email });
  // create If Not Exist
  const exsting = await AuthIdentity.findOneAndUpdate(
    {
      provider: LOGIN_PROVIDER[1],
      providerId: sub,
    },
    {
      $setOnInsert: {
        userId: userSession._id,
        provider: LOGIN_PROVIDER[1],
        providerId: sub,
        providerEmail: email,
      },
    },
    {
      new: true,
      upsert: true,
      includeResultMetadata: true,
    },
  );
  if (exsting.lastErrorObject?.updatedExisting) {
    throw new ApiError(400, "This email alredy Link to another account");
  }
  return exsting.value;
};

export const accConnectEmail = async (userSession, { email, password }) => {
  if (process.env.IS_VERFIY_OTP === "true") {
    const exting = await AuthIdentity.exists({
      provider: LOGIN_PROVIDER[0],
      providerId: email,
    });
    if (exting) {
      throw new ApiError(400, "This email alredy Link to another account");
    }
    await sendOtpToMail(userSession._id);
    return {
      is_otp: true,
    };
  }

  const exsting = await AuthIdentity.findOneAndUpdate(
    {
      provider: LOGIN_PROVIDER[0],
      providerId: email,
    },
    {
      $setOnInsert: {
        userId: userSession._id,
        provider: LOGIN_PROVIDER[0],
        providerId: email,
        providerEmail: email,
        passwordHash: password,
      },
    },
    {
      new: true,
      upsert: true,
      includeResultMetadata: true,
    },
  );
  if (exsting.lastErrorObject?.updatedExisting) {
    throw new ApiError(400, "This email alredy Link to another account");
  }
  return exsting.value;
};

// verify mail otp
export const verifyAccConnectOtp = async (userSession, { email, password }) => {
  await verifyMailOTP(userSession._id);

  const exsting = await AuthIdentity.findOneAndUpdate(
    {
      provider: LOGIN_PROVIDER[0],
      providerId: email,
    },
    {
      $setOnInsert: {
        userId: userSession._id,
        provider: LOGIN_PROVIDER[0],
        providerId: email,
        providerEmail: email,
        passwordHash: password,
      },
    },
    {
      new: true,
      upsert: true,
      includeResultMetadata: true,
    },
  );
  if (exsting.lastErrorObject?.updatedExisting) {
    throw new ApiError(400, "This email alredy Link to another account");
  }

  return exsting.value;
};

export const disConnectLinkAccount = async (id) => {
  await AuthIdentity.deleteOne({ _id: id });
};

export const descreesStorage = async (id, storageSize) => {
  await User.updateOne(
    {
      _id: id,
    },
    {
      $inc: {
        maxStorageBytes: storageSize,
      },
    },
  );
  await deleteRedisKey(`user:${id}`);
};
