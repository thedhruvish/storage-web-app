import ApiResponse from "../utils/ApiResponse.js";
import {
  listSubscriptionsService,
  toggleSubscriptionService,
  getSubscriptionHistoryService,
  generateCustomerPortalService,
  getSettingInfoService,
  deleteAuthMethodService,
  toggleTwoFaService,
  deactivateAccount,
  wipeAllData,
  deleteAccount,
} from "../services/account.service.js";
import ApiError from "../utils/ApiError.js";

// subscriptions
export const listAllSubscription = async (req, res) => {
  const subscriptions = await listSubscriptionsService(req.user._id);

  res
    .status(200)
    .json(
      new ApiResponse(200, "Send All the Subscription List", subscriptions),
    );
};

export const toggleSubscriptionStatus = async (req, res) => {
  await toggleSubscriptionService(req.params.id);

  res.status(200).json(new ApiResponse(200, "Subscription status toggled"));
};

export const getUserSubscriptionHistory = async (req, res) => {
  const history = await getSubscriptionHistoryService(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Send All the Subscription List", history));
};

// billing / payment
export const updatePaymentMethodDetails = async (req, res) => {
  const url = await generateCustomerPortalService(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, "Customer Portal Link gen", { url }));
};

// settings
export const settingInfo = async (req, res) => {
  const { sessionId } = req.signedCookies;

  const info = await getSettingInfoService(req.user._id);

  res
    .status(200)
    .json(new ApiResponse(200, "Get Setting info", { ...info, sessionId }));
};

// auth methods
export const deleteAuthMethod = async (req, res) => {
  await deleteAuthMethodService(
    req.params.twofactor,
    req.params.credentialOrName,
  );

  res.status(200).json(new ApiResponse(200, "successfully delete auth method"));
};

export const toggleTwoFaAuth = async (req, res) => {
  await toggleTwoFaService(req.params.id);

  res.status(200).json(new ApiResponse(200, "successfully Toggle 2 fa auth"));
};

// Danger zone
export const dangerZoneControll = async (req, res) => {
  const { method } = req.body;
  const userId = req.user._id;
  if (method === "deactivate") {
    await deactivateAccount({ userId });
  } else if (method === "wipe") {
    await wipeAllData({ userId });
  } else if (method === "delete") {
    await deleteAccount({ userId });
  } else {
    return res.status(400).json(new ApiError(400, "Select Valid Option"));
  }
  res.status(200).json(new ApiResponse(200, "successfully Complete"));
};
