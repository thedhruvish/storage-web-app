import express from "express";
import {
  getUserSubscriptionHistory,
  listAllSubscription,
  toggleSubscriptionStatus,
  updatePaymentMethodDetails,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/subscriptions", listAllSubscription);

router.put("/subscriptions/:id/toggle", toggleSubscriptionStatus);

router.get("/subscriptions/:id/history", getUserSubscriptionHistory);

router.get("/update-payment-details", updatePaymentMethodDetails);
export default router;
