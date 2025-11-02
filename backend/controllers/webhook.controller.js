import Subscription from "../models/Subscription.model.js";
import { verifyStripeWebhook } from "../utils/stripeHelper.js";
import redisClient from "../config/redis-client.js";

export const stripeWebhookHandler = async (req, res) => {
  let event;
  try {
    event = await verifyStripeWebhook(req);
  } catch (err) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message);
    return res.sendStatus(400);
  }
  console.log(event.type);
  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded":
      console.log(event.data.object);
      break;
    case "checkout.session.completed":
      const checkoutSessionObj = event.data.object;
      //  when first time payment
      if (checkoutSessionObj.status === "complete") {
        await redisClient.del(
          `checkoutUrl:${checkoutSessionObj.metadata.userId}:${checkoutSessionObj.id}`,
        );
        await Subscription.create({
          planId: checkoutSessionObj.metadata.planId,
          userId: checkoutSessionObj.metadata.userId,
          customerId: checkoutSessionObj.customerId,
          startDate: new Date(checkoutSessionObj.created * 1000),
          endDate: new Date(checkoutSessionObj.expires_at * 1000),
          subscriptionId: checkoutSessionObj.subscription,
          status: "active",
          paymentType: "stripe",
        });
      }
      break;

    case "invoice.payment_succeeded":
      const paymentSuccessObj = event.data.object;
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  console.log(`Webhook received: ${event.type}`);
  res.json({ received: true });
};
