import express from "express";
import { stripeWebhookHandler } from "../controllers/stripe.webhook.controller.js";

const router = express.Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

export default router;
