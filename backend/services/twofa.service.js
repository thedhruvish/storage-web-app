import redisClient from "../config/redis-client.js";
import TwoFa from "../models/TwoFa.model.js";
import User from "../models/User.model.js";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { createAndCheckLimitSession } from "./redis.service.js";
import ApiError from "../utils/ApiError.js";

export const setup2FA = async (userSession, method) => {
  const user = await User.findById(userSession._id);
  if (!user) throw new ApiError(401, "Login required");

  if (method === "totp") {
    const totp = genTOTPUrl(user.email);

    await TwoFa.findByIdAndUpdate(
      user.twoFactorId,
      { "totp.secret": totp.secret, isEnabled: true },
      { upsert: true, new: true },
    );

    return totp;
  }

  if (method === "passkeys") {
    const passkeys = user.twoFactorId
      ? (await TwoFa.findById(user.twoFactorId)).passkeys
      : [];

    const options = await generateRegisterOptionInPasskey(user, passkeys);

    await redisClient.set(`passkeys:${user._id}`, options.challenge, {
      expiration: { type: "EX", value: 60 },
    });

    return options;
  }
};

export const verifyTOTPSetup = async (userSession, { token, friendlyName }) => {
  const user = await User.findById(userSession._id).populate({
    path: "twoFactorId",
    select: "+totp.secret",
  });

  if (
    !isValidTotpToken({
      secret: user.twoFactorId.totp.secret,
      token,
    })
  ) {
    throw new ApiError(401, "Invalid OTP");
  }

  const { hashedCodes, plainTextCodes } = await generateBackupCode();

  await TwoFa.findByIdAndUpdate(user.twoFactorId._id, {
    "totp.isVerified": true,
    "totp.friendlyName": friendlyName,
    recoveryCodes: hashedCodes,
    isEnabled: true,
  });

  return {
    verified: true,
    recoveryCodes: plainTextCodes,
  };
};

export const loginWithTOTP = async ({ userId, token }) => {
  const user = await User.findById(userId).populate({
    path: "twoFactorId",
    select: "+totp.secret",
  });

  if (
    !isValidTotpToken({
      secret: user.twoFactorId.totp.secret,
      token,
    })
  ) {
    throw new ApiError(401, "Invalid OTP");
  }

  const sessionId = await createAndCheckLimitSession(user.id);

  return {
    cookie: {
      name: "sessionId",
      value: sessionId,
      options: { httpOnly: true, secure: true },
    },
  };
};

export const generateLoginChallenge = async (userId) => {
  const options = await genPasskeyOptions();

  await redisClient.set(`passkeys-login:${userId}`, options.challenge, {
    expiration: { type: "EX", value: 60 },
  });

  return options;
};

export const verifyLoginPasskey = async ({ response, userId }) => {
  const expectedChallenge = await redisClient.get(`passkeys-login:${userId}`);
  if (!expectedChallenge) throw new ApiError(400, "Challenge expired");

  const user = await User.findById(userId).populate("twoFactorId");
  const authenticator = user.twoFactorId.passkeys.find(
    (p) => p.credentialID === response.id,
  );

  const verification = await verifyLoginPasskeyChallenge({
    response,
    expectedChallenge,
    authenticator,
  });

  if (!verification.verified) {
    throw new ApiError(401, "Invalid passkey");
  }

  await TwoFa.updateOne(
    { _id: user.twoFactorId._id, "passkeys.credentialID": response.id },
    {
      $set: {
        "passkeys.$.counter": verification.authenticationInfo.newCounter,
        "passkeys.$.lastUsed": new Date(),
      },
    },
  );

  const sessionId = await createAndCheckLimitSession(user.id);

  return {
    cookie: {
      name: "sessionId",
      value: sessionId,
      options: { httpOnly: true, secure: true },
    },
  };
};

export const verifyPasskeyRegistration = async (
  userSession,
  { token, friendlyName },
) => {
  const user = await User.findById(userSession._id).populate({
    path: "twoFactorId",
    select: "+totp.secret",
  });
  if (!user || !user.twoFactorId) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "2FA setup not initiated. Please generate a QR code first.",
        ),
      );
  }
  const isValidTotp = isValidTotpToken({
    secret: user.twoFactorId.totp.secret,
    token,
  });
  if (!isValidTotp) {
    return res
      .status(401)
      .json(new ApiError(401, "Your Token is expiry or invalid"));
  }
  const { hashedCodes, plainTextCodes } = await generateBackupCode();
  await TwoFa.findByIdAndUpdate(user.twoFactorId._id, {
    "totp.isVerified": true,
    isEnabled: true,
    "totp.friendlyName": friendlyName,
    recoveryCodes: hashedCodes,
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
