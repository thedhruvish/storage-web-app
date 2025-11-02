import Subscription from "../models/Subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js  ";
import {
  pauseStripeSubscription,
  resumeStripeSubscription,
} from "../utils/stripeHelper.js";

export const listAllSubscription = async (req, res) => {
  const userId = req.user;

  const subscriptions = await Subscription.find({ userId }).populate({
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
    await pauseStripeSubscription(subscription.subscriptionId);
  } else {
    await resumeStripeSubscription(subscription.subscriptionId);
  }
  res.status(200).json(new ApiResponse(200, "Subscription status toggled"));
};
