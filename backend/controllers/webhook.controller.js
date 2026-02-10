import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils.js";
import ApiError from "../utils/ApiError.js";
import WebHookLog from "../models/WebHookLog.model.js";
import {
  handleSubscriptionActivated,
  handleSubscriptionCompleted,
  handleSubscriptionCancelled,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from "../services/razorpay.webhook.service.js";

import {
  handleStripeWebhookEvent,
  verifyStripeWebhook,
} from "../services/stripe.webhook.service.js";

export const stripeWebhookHandler = async (req, res) => {
  let event;
  res.json({ received: true });

  try {
    event = await verifyStripeWebhook(req);
  } catch (err) {
    return res.sendStatus(400);
  }

  await handleStripeWebhookEvent(event);
};

export const razorpayWebhookHandler = async (req, res) => {
  const webhookSignature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = req.body.toString();

  const isValidSignature = validateWebhookSignature(
    rawBody,
    webhookSignature,
    webhookSecret,
  );

  if (!isValidSignature) {
    return res.status(400).json(new ApiError(400, "Invalid webhook signature"));
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;


  // Safe subscription handling
  let subscriptionId = null;
  let userId = null;

  if (payload.payload?.subscription) {
    const sub = payload.payload.subscription.entity;
    subscriptionId = sub.id;
    userId = sub.notes?.userId;
  }

  if (payload.payload?.invoice) {
    subscriptionId = payload.payload.invoice.entity.subscription_id;
  }
  await WebHookLog.create({
    type: event,
    data: payload,
    paymentType: "razorpay",
  });

  res.status(200).json({ status: "ok" });
  console.log(event)
  switch (event) {
    case "subscription.activated":
      // subscription activated
      await handleSubscriptionActivated(payload);
      break;
    case "subscription.completed":
      // subscription completed
      await handleSubscriptionCompleted(payload);
      break;
    case "subscription.cancelled":
      // subscription cancelled
      await handleSubscriptionCancelled(payload);
      break;
    case "subscription.paused":
      // subscription paused
      await handleSubscriptionPaused(payload);
      break;
    case "subscription.resumed":
      // subscription resumed
      await handleSubscriptionResumed(payload);
      break;
    case "invoice.paid":
      // recurring payment
      await handleInvoicePaid(payload);
      break;
    case "invoice.payment_failed":
      // payment failed
      await handleInvoicePaymentFailed(payload);
      break;

    default:
      break;
  }
};
