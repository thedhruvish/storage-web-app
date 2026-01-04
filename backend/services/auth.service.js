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
import { createAndCheckLimitSession, setRedisValue } from "./redis.service.js";
import { sendOtpToMail, verifyMailOTP } from "./mail.service.js";
import { googleClient } from "../lib/google.client.js";
import { LOGIN_PROVIDER } from "../constants/constant.js";
import AuthIdentity from "../models/AuthIdentity.model.js";

export const registerWithEmailService = async ({
  name,
  email,
  password,
  turnstileToken,
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  await validTurnstileToken(turnstileToken);

  await exstingAuthIdentity({
    provider: LOGIN_PROVIDER[0],
    providerId: normalizedEmail,
  });

  await createNewUser(
    {
      name,
      email: normalizedEmail,
      metaData: { showSetUp2Fa: true },
    },
    normalizedEmail,
    LOGIN_PROVIDER[0],
    password,
  );
};

export const loginWithEmailService = async (req) => {
  const { email, password, turnstileToken } = req.body;
  await validTurnstileToken(turnstileToken);

  const authIdentity = await getOneAuthIdentity({
    providerEmail: email,
    provider: LOGIN_PROVIDER[0],
  });
  console.log(authIdentity);
  if (!authIdentity) throw new ApiError(401, "Invalidss email or password");
  if (authIdentity.userId.isDeleted)
    throw new ApiError(409, "Account deleted. Contact admin");

  const isValidPwd = await authIdentity.isValidPassword(password);
  if (!isValidPwd) throw new ApiError(401, "Invalids email or password");

  // 2FA flow
  if (authIdentity.userId.twoFactorId?.isEnabled) {
    return {
      step: "2FA",
      data: {
        isTotp: !!authIdentity.userId.twoFactorId.totp?.isVerified,
        isPasskey: authIdentity.userId.twoFactorId.passkeys?.length > 0,
        userId: authIdentity.userId._id,
      },
    };
  }

  // OTP flow
  if (process.env.IS_VERFIY_OTP === "true") {
    await sendOtpToMail(authIdentity.userId._id.toString());
    return { step: "OTP", userId: authIdentity.userId._id };
  }

  const sessionId = await createAndCheckLimitSession({
    userId: authIdentity.userId._id.toString(),
    req,
  });

  return {
    step: "LOGIN",
    sessionId,
    showSetUp2Fa: authIdentity.userId.metaData?.showSetUp2Fa === true,
    userId: authIdentity.userId._id,
  };
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
