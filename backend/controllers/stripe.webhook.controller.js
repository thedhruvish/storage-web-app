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
