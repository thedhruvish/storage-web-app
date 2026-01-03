import express from "express";
import paramsValidation from "../middlewares/paramsValidation.middleware.js";
import {
  settingInfo,
  deleteAuthMethod,
  toggleTwoFaAuth,
  getUserSubscriptionHistory,
  listAllSubscription,
  toggleSubscriptionStatus,
  updatePaymentMethodDetails,
} from "../controllers/account.controller.js";

const router = express.Router();

// setting  info
router.get("/settings/info", settingInfo);

router.param("twoFactorId", paramsValidation);

router.delete("/settings/:twofactor/:credentialOrName", deleteAuthMethod);

router.param("id", paramsValidation);

router.put("/settings/2fa/:id/toggle", toggleTwoFaAuth);

// subscription handle

router.get("/subscriptions", listAllSubscription);

router.get("/update-payment-details", updatePaymentMethodDetails);

router.put("/subscriptions/:id/toggle", toggleSubscriptionStatus);

router.get("/subscriptions/:id/history", getUserSubscriptionHistory);

export default router;
