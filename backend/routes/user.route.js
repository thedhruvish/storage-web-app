import express from "express";
import {
  getUserSubscriptionHistory,
  listAllSubscription,
  settingInfo,
  toggleSubscriptionStatus,
  updatePaymentMethodDetails,
} from "../controllers/user.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
const router = express.Router();
// setting  info
router.get("/settings/info", settingInfo);

// subscription handle

router.get("/subscriptions", listAllSubscription);

router.get("/update-payment-details", updatePaymentMethodDetails);

router.param("id", paramsValidation);

router.put("/subscriptions/:id/toggle", toggleSubscriptionStatus);

router.get("/subscriptions/:id/history", getUserSubscriptionHistory);

export default router;
