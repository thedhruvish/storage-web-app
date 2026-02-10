import express from "express";
import { stripeWebhookHandler } from "../controllers/webhook.controller.js";
import { razorpayWebhookHandler } from "../controllers/webhook.controller.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhookHandler,
);

export default router;
