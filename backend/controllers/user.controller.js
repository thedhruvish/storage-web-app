import Subscription from "../models/Subscription.model.js";
import ApiResponse from "../utils/ApiResponse.js  ";

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
