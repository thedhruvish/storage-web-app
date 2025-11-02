import express from "express";
import {
  listAllSubscription,
  toggleSubscriptionStatus,
} from "../controllers/user.controller.js";
const router = express.Router();

router.get("/subscriptions", listAllSubscription);
router.put("/subscriptions/:id/toggle", toggleSubscriptionStatus);
export default router;
