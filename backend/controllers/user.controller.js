import Subscription from "../models/Subscription.model.js";
import User, { LOGIN_PROVIDER } from "../models/User.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createCustomerPortalSession,
  pauseStripeSubscription,
  resumeStripeSubscription,
} from "../utils/stripeHelper.js";

export const listAllSubscription = async (req, res) => {
  const userId = req.user;

  const subscriptions = await Subscription.find({
    userId,
    subscriptionParentId: null,
  }).populate({
    path: "planId",
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "Send All the Subscription List", subscriptions),
    );
};

// toggle subscription status
export const toggleSubscriptionStatus = async (req, res) => {
  const { id } = req.params;

  const subscription = await Subscription.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          isPauseCollection: { $not: ["$isPauseCollection"] },
        },
      },
    ],
    { new: true },
  );
  if (subscription.isPauseCollection) {
    await pauseStripeSubscription(subscription.stripeSubscriptionId);
  } else {
    await resumeStripeSubscription(subscription.stripeSubscriptionId);
  }
  res.status(200).json(new ApiResponse(200, "Subscription status toggled"));
};

export const getUserSubscriptionHistory = async (req, res) => {
  const { id } = req.params;
  const subscriptionHistory = await Subscription.find({
    subscriptionParentId: id,
  }).populate();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Send All the Subscription List",
        subscriptionHistory,
      ),
    );
};

export const updatePaymentMethodDetails = async (req, res) => {
  const user = await User.findById(req.user._id);
  const session = await createCustomerPortalSession(user.stripeCustomerId);
  console.log(session);
  res
    .status(200)
    .json(
      new ApiResponse(200, "Customer Portal Link gen", { url: session.url }),
    );
};

// get info about settings
export const settingInfo = async (req, res) => {
  let userInfo = await User.findById(req.user._id).populate("twoFactor");
  let passkey = null;

  // if exsting than it save.
  if (userInfo.twoFactor) {
    passkey = userInfo.twoFactor.passkeys?.map((item) => {
      return {
        type: "passkey",
        friendlyName: item.friendlyName,
        createdAt: item.createdAt,
        credentialID: item.credentialID,
        transports: item.transports,
        lastUsed: item?.lastUsed,
      };
    });
  }

  // tops it exsting than it push array.
  if (userInfo.twoFactor.totp) {
    userInfo.twoFactor.totp.type = "totp";
    passkey.push(userInfo.twoFactor.totp);
  }

  const isPremium = await Subscription.exists({
    userId: userInfo._id,
    status: "active",
  });
  const connectedAccounts = LOGIN_PROVIDER.map((method) => {
    return {
      provider: method,
      email:
        method === "password"
          ? userInfo.email
          : method === "google"
            ? userInfo.googleEmail
            : method === "github"
              ? userInfo.githubEmail
              : null,
    };
  });

  const customInfo = {
    twoFactor: userInfo.twoFactor.isEnabled ? passkey : [],
    loginProvider: userInfo.loginProvider,
    connectedAccounts: connectedAccounts,
    isTwoFactorEnabled: userInfo.twoFactor.isEnabled,
    user: {
      name: userInfo.name,
      email: userInfo.email,
      avatarUrl: userInfo.picture,
      isPremium: isPremium ? true : false,
    },
  };

  res.status(200).json(new ApiResponse(200, "Get Setting info", customInfo));
};
