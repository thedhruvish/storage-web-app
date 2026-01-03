import redisClient from "../config/redis-client.js";
import TwoFa from "../models/TwoFa.model.js";
import User from "../models/User.model.js";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { createAndCheckLimitSession } from "./redis.service.js";
import ApiError from "../utils/ApiError.js";
import {
  generateBackupCode,
  generateRegisterOptionInPasskey,
  genPasskeyOptions,
  genTOTPUrl,
  isValidTotpToken,
  verifyLoginPasskeyChallenge,
} from "./twoStep.service.js";
import { SESSION_OPTIONS } from "../constants/constant.js";

export const setup2FA = async (userSession, method) => {
  const user = await User.findById(userSession._id);
  if (!user) throw new ApiError(401, "Login required");

  if (method === "totp") {
    const totp = genTOTPUrl(user.email);

    const twoFaObject = { "totp.secret": totp.secret, isEnabled: true };
    if (user?.twoFactorId) {
      await TwoFa.findByIdAndUpdate(user.twoFactor, twoFaObject);
    } else {
      const newTwoFa = await TwoFa.create(twoFaObject);
      user.twoFactorId = newTwoFa._id;
      await user.save();
    }

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
  console.log("run");
  console.log(JSON.stringify(user, null, 2));
  console.log("end");
  if (
    !isValidTotpToken({
      secret: user.twoFactorId?.totp.secret,
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
  if (!user.twoFactorId) {
    throw new ApiError(400, "User not found");
  }
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
      options: SESSION_OPTIONS,
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
  { friendlyName, response },
) => {
  const expectedChallenge = await redisClient.get(
    `passkeys:${userSession._id.toString()}`,
  );
  if (!expectedChallenge) {
    throw new ApiError(401, "2FA setup not initiated. Please Init first");
  }

  const verification = await verifyRegistrationResponse({
    expectedChallenge,
    response: response,
    expectedOrigin: process.env.FRONTEND_URL,
  });

  if (!(verification.registrationInfo && verification.verified)) {
    throw new ApiError(400, "Try Agin", { verified: false });
  }
  const { credential } = verification.registrationInfo;
  const user = await User.findById(userSession._id).populate({
    path: "twoFactorId",
    select: "recoveryCodes",
  });

  const passkeyObj = {
    credentialID: credential.id,
    credentialPublicKey: Buffer.from(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports,
    friendlyName: friendlyName,
  };
  let plainTextCodes;
  if (user?.twoFactorId._id) {
    // is exsting mean they alredy setup the TOTP than just update
    await TwoFa.findByIdAndUpdate(user.twoFactorId, {
      $push: {
        passkeys: passkeyObj,
      },
      $set: { isEnabled: true },
    });
  } else {
    const genCode = await generateBackupCode();
    const newTwoFa = await TwoFa.create({
      passkeys: passkeyObj,
      isEnabled: true,

      recoveryCodes: genCode.hashedCodes,
    });
    plainTextCodes = genCode.plainTextCodes;
    user.twoFactorId = newTwoFa._id;
    await user.save();
  }

  return {
    verified: true,
    plainTextCodes,
    message:
      "Please save these recovery codes safely. You will not see them again.",
  };
};
