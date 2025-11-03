import Subscription from "../models/Subscription.model.js";
import User from "../models/User.model.js";
import ApiResponse from "../utils/ApiResponse.js  ";
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
