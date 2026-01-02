import { LOGIN_PROVIDER } from "../constants/constant.js";
import Subscription from "../models/Subscription.model.js";
import TwoFa from "../models/TwoFa.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import {
  createCustomerPortalSession,
  pauseStripeSubscription,
  resumeStripeSubscription,
} from "./stripe.service.js";

// subscriptions
export const listSubscriptionsService = async (userId) => {
  return Subscription.find({
    userId,
    subscriptionParentId: null,
  }).populate("planId");
};

export const toggleSubscriptionService = async (subscriptionId) => {
  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    [
      {
        $set: {
          isPauseCollection: { $not: ["$isPauseCollection"] },
        },
      },
    ],
    { new: true },
  );

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (subscription.isPauseCollection) {
    await pauseStripeSubscription(subscription.stripeSubscriptionId);
  } else {
    await resumeStripeSubscription(subscription.stripeSubscriptionId);
  }
};

export const getSubscriptionHistoryService = async (parentId) => {
  return Subscription.find({
    subscriptionParentId: parentId,
  }).populate();
};

// billing
export const generateCustomerPortalService = async (userId) => {
  const user = await User.findById(userId);
  if (!user?.stripeCustomerId) {
    throw new ApiError(400, "Stripe customer not found");
  }

  const session = await createCustomerPortalSession(user.stripeCustomerId);

  return session.url;
};

// settings
export const getSettingInfoService = async (userId) => {
  const userInfo = await User.findById(userId).populate("twoFactorId");
  if (!userInfo) throw new ApiError(404, "User not found");

  let passkey = [];
  let isAllowedNewTOTP = true;

  if (userInfo?.twoFactorId?.passkeys?.length) {
    passkey = userInfo.twoFactorId.passkeys.map((item) => ({
      type: "passkey",
      friendlyName: item.friendlyName,
      createdAt: item.createdAt,
      credentialID: item.credentialID,
      transports: item.transports,
      lastUsed: item?.lastUsed,
    }));
  }

  if (userInfo?.twoFactorId?.totp) {
    userInfo.twoFactorId.totp.type = "totp";
    passkey.push(userInfo.twoFactorId.totp);
    isAllowedNewTOTP = false;
  }

  const isPremium = await Subscription.exists({
    userId,
    status: "active",
  });

  const connectedAccounts = LOGIN_PROVIDER.map((method) => ({
    provider: method,
    email:
      method === LOGIN_PROVIDER[0]
        ? userInfo.email
        : method === LOGIN_PROVIDER[1]
          ? userInfo.googleEmail
          : method === LOGIN_PROVIDER[2]
            ? userInfo.githubEmail
            : null,
  }));

  return {
    twoFactor: passkey,
    loginProvider: userInfo.loginProvider,
    twoFactorId: userInfo?.twoFactorId?._id,
    connectedAccounts,
    isTwoFactorEnabled: userInfo?.twoFactorId?.isEnabled,
    isAllowedNewTOTP,
    user: {
      name: userInfo.name,
      email: userInfo.email,
      avatarUrl: userInfo.picture,
      isPremium: Boolean(isPremium),
    },
  };
};

// auth methods
export const deleteAuthMethodService = async (
  twoFactorId,
  credentialOrName,
) => {
  if (credentialOrName.length === 43) {
    await TwoFa.findOneAndUpdate(
      {
        _id: twoFactorId,
        "passkeys.credentialID": credentialOrName,
      },
      { $pull: { passkeys: { credentialID: credentialOrName } } },
    );
  } else {
    await TwoFa.findOneAndUpdate(
      {
        _id: twoFactorId,
        "totp.friendlyName": credentialOrName,
      },
      { $unset: { totp: "" } },
    );
  }
};

export const toggleTwoFaService = async (twoFaId) => {
  await TwoFa.findByIdAndUpdate(twoFaId, [
    {
      $set: {
        isEnabled: { $not: ["$isEnabled"] },
      },
    },
  ]);
};
