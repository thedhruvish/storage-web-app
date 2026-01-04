import mongoose from "mongoose";
import { LOGIN_PROVIDER } from "../constants/constant.js";
import AuthIdentity from "../models/AuthIdentity.model.js";
import Directory from "../models/Directory.model.js";
import Document from "../models/Document.model.js";
import SessionHistory from "../models/SessionHistory.model.js";
import Subscription from "../models/Subscription.model.js";
import TwoFa from "../models/TwoFa.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { deleteAllUserSessions } from "./redis.service.js";
import { bulkDeleteS3Objects } from "./s3.service.js";
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
  const userInfoPromise = User.findById(userId).populate("twoFactorId");

  const authenticatePromise = AuthIdentity.find({
    userId,
  }).select("-userId -createdAt -updatedAt -__v ");

  const sessionHistoryPromise = SessionHistory.find({
    userId,
  })
    .select("-userId -updatedAt -__v -userAgent")
    .sort({ createdAt: -1 });

  const isPremiumPromise = Subscription.exists({
    userId,
    status: "active",
  });

  const [authenticate, sessionHistory, userInfo, isPremium] = await Promise.all(
    [
      authenticatePromise,
      sessionHistoryPromise,
      userInfoPromise,
      isPremiumPromise,
    ],
  );

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
    authenticate,
    sessionHistory,
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

export const deactivateAccount = async ({ userId }) => {
  await deleteAllUserSessions(userId);
  await User.findByIdAndUpdate(userId, { isDeleted: true });
};

export const wipeAllData = async ({ userId }) => {
  const session = await mongoose.startSession();
  let s3ObjectsToDelete = [];

  try {
    await session.withTransaction(() => {
      return Document.find({ userId })
        .select("_id extension")
        .session(session)
        .lean()
        .then((documents) => {
          s3ObjectsToDelete = documents.map((file) => ({
            Key: `${file._id}${file.extension}`,
          }));

          return Promise.all([
            Directory.deleteMany(
              { userId, parentDirId: { $ne: null } },
              { session },
            ),

            Document.deleteMany({ userId }, { session }),

            Directory.findOneAndUpdate(
              { userId, parentDirId: null },
              { "metaData.size": 0 },
              { session },
            ),
          ]);
        });
    });

    // ✅ External side-effect AFTER transaction commits
    if (s3ObjectsToDelete.length > 0) {
      await bulkDeleteS3Objects(s3ObjectsToDelete);
    }
  } catch (error) {
    throw new ApiError(400, error.message);
  } finally {
    session.endSession();
  }
};

export const deleteAccount = async ({ userId }) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Promise.all([
        deactivateAccount({ userId }),
        wipeAllData({ userId }),
      ]);
    });
  } catch (error) {
    throw new ApiError(400, "Error: to Delete Account");
  } finally {
    session.endSession();
  }
};
