import {
  generateBackupCode,
  generateRegisterOptionInPasskey,
  genPasskeyOptions,
  genTOTPUrl,
  isValidTotpToken,
  verifyLoginPasskeyChallenge,
} from "../services/twoStep.service.js";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import redisClient from "../config/redis-client.js";
import TwoFa from "../models/TwoFa.model.js";
import User from "../models/User.model.js";
import { createAndCheckLimitSession } from "../services/redis.service.js";

// 2fa setup register
export const twoFASetup = async (req, res) => {
  const { method } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json(new ApiError(401, "Login Required"));
  }
  let resData;

  if (method === "totp") {
    // time base otp is gen a url
    resData = genTOTPUrl(req.user.email);
    const twoFaObject = {
      isEnabled: true,
      "totp.secret": resData.secret,
    };
    if (user?.twoFactorId) {
      await TwoFa.findByIdAndUpdate(user.twoFactorId, twoFaObject);
    } else {
      const newTwoFa = await TwoFa.create(twoFaObject);
      user.twoFactorId = newTwoFa._id;
      user.save();
    }
  } else if (method === "passkeys") {
    // passkey logic
    let passkey = [];
    if (user?.twoFactorId) {
      const twoFa = await TwoFa.findById(user._id);
      passkey = twoFa?.passkeys;
    }

    resData = await generateRegisterOptionInPasskey(user, passkey);

    await redisClient.set(
      `passkeys:${req.user._id.toString()}`,
      resData.challenge,
      {
        expiration: {
          type: "EX",
          value: 60,
        },
      },
    );
  }
  return res
    .status(201)
    .json(new ApiResponse(201, "two setup successfuly generator", resData));
};

//  verfiy the TOTP token first time
export const totpRegisterVerify = async (req, res) => {
  const { token, friendlyName } = req.body;
  const user = await User.findById(req.user._id).populate({
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

export const passkeyRegisterVerify = async (req, res) => {
  const body = req.body;
  const userId = req.user._id;

  const expectedChallenge = await redisClient.get(
    `passkeys:${userId.toString()}`,
  );

  if (!expectedChallenge) {
    return res
      .status(400)
      .json(new ApiError(400, "2FA setup not initiated. Please Init first."));
  }

  const verification = await verifyRegistrationResponse({
    expectedChallenge,
    response: body.response,
    expectedOrigin: "http://localhost:3000",
  });

  if (verification.registrationInfo && verification.verified) {
    const { credential } = verification.registrationInfo;

    const user = await User.findById(req.user._id);

    if (!user) {
      if (!user) {
        return res.status(401).json(new ApiError(401, "Login Required"));
      }
    }

    const passkeyObj = {
      credentialID: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports,
      friendlyName: body.friendlyName,
    };
    if (user.twoFactorId) {
      // is exsting mean they alredy setup the TOTP than just update
      await TwoFa.findByIdAndUpdate(user.twoFactorId, {
        $push: {
          passkeys: passkeyObj,
        },
        $set: { isEnabled: true },
      });
    } else {
      // create a new record for the twoFa
      const newTwoFa = await TwoFa.create({
        passkeys: passkeyObj,
        isEnabled: true,
      });
      user.twoFactorId = newTwoFa._id;
      await user.save();
    }
    res
      .status(201)
      .json(new ApiResponse(201, "Verified SuccessFully", { verified: true }));
  } else {
    res.status(400).json(new ApiError(400, "Try Agin", { verified: false }));
  }
};

/**
 * login with 2fa
 */
export const twoFaLoginTotp = async (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    return res.status(422).json(new ApiError(422, "Invalid body"));
  }
  const user = await User.findById(userId).populate({
    path: "twoFactor",
    select: "+totp.secret",
  });
  if (!user) {
    return res.status(422).json(new ApiError(422, "User does not exsting"));
  }

  const isValidTotp = isValidTotpToken({
    secret: user.twoFactorId.totp.secret,
    token,
  });

  if (!isValidTotp) {
    return res.status(422).json(new ApiError(422, "Invalid OTP"));
  }
  const sessionId = await createAndCheckLimitSession(user.id.toString());

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User login Successfuly", { is_verfiy_otp: true }),
    );
};

// generate passkey challenge
export const generatePasskeyChallenge = async (req, res) => {
  const { userId } = req.body;

  const options = await genPasskeyOptions();

  // save session challenge to after verify
  await redisClient.set(`passkeys-login:${userId}`, options.challenge, {
    expiration: {
      type: "EX",
      value: 60,
    },
  });
  res.status(200).json(new ApiResponse(200, "Generator a challenge", options));
};

// verfiy created session and set create new session and set cookie
export const verifyPasskeyChallenge = async (req, res) => {
  const { response, userId } = req.body;

  const expectedChallenge = await redisClient.get(`passkeys-login:${userId}`);

  if (!expectedChallenge) {
    res.status(400).json(new ApiError(400, "Try agin to login"));
  }

  const user = await User.findById(userId).populate("twoFactor");

  const authenticator = user.twoFactorId.passkeys.find(
    (p) => p.credentialID === response.id,
  );
  const verification = await verifyLoginPasskeyChallenge({
    response,
    expectedChallenge,
    authenticator,
  });
  if (!verification.verified) {
    return res
      .status(400)
      .json(new ApiError(400, "You passkey are the different."));
  }
  const { authenticationInfo } = verification;

  await TwoFa.updateOnedhruv(
    {
      _id: user.twoFactorId._id,
      "passkeys.credentialID": response.id,
    },
    {
      $set: {
        "passkeys.$.counter": authenticationInfo.newCounter,
        "passkeys.$.lastUsed": new Date(),
      },
    },
  );

  const sessionId = await createAndCheckLimitSession(user.id.toString());

  res.cookie("sessionId", sessionId, {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    signed: true,
  });

  res.status(200).json(new ApiResponse(200, "User login Successfuly"));
};
