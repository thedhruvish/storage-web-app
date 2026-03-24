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
  dangerZoneControll,
} from "../controllers/account.controller.js";
import { validateInput } from "../utils/validateInput.js";
import {
  dangerZoneValidator,
  updateUserInfoValidator,
  uploadAvatarValidator,
  expoPushTokenValidator,
} from "../validators/auth.validator.js";
import {
  cancelRazorpayPaymentController,
  updateUserDetails,
  genAvatarImgUploadLink,
  expoPushTokenSet,
  expoPushTokenDelete,
} from "../controllers/user.controller.js";

const router = express.Router();

// setting  info
router.get("/settings/info", settingInfo);

router.param("twoFactorId", paramsValidation);

router.param("id", paramsValidation);

router.patch(
  "/update",
  validateInput(updateUserInfoValidator),
  updateUserDetails,
);
router
  .route("/push")
  .post(validateInput(expoPushTokenValidator), expoPushTokenSet)
  .delete(expoPushTokenDelete);

router.post(
  "/avatar-gen",
  validateInput(uploadAvatarValidator),
  genAvatarImgUploadLink,
);

router.post("/cancel-razorpay-payment/:id", cancelRazorpayPaymentController);

router.delete("/settings/:twofactor/:credentialOrName", deleteAuthMethod);

router.put("/settings/2fa/:id/toggle", toggleTwoFaAuth);

// subscription handle

router.get("/subscriptions", listAllSubscription);

router.get("/update-payment-details", updatePaymentMethodDetails);

router.put("/subscriptions/:id/toggle", toggleSubscriptionStatus);

router.get("/subscriptions/:id/history", getUserSubscriptionHistory);

// Deactivate Account  /  Wipe Data  / Permanently remove  account.
router.post(
  "/danger-zone",
  validateInput(dangerZoneValidator),
  dangerZoneControll,
);

export default router;
