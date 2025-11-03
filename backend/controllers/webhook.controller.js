import Subscription from "../models/Subscription.model.js";
import { verifyStripeWebhook } from "../utils/stripeHelper.js";
import redisClient from "../config/redis-client.js";
import User from "../models/User.model.js";

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
      const objSub = event.data.object;
      const parentSubscription = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: objSub.subscription },
        {
          $push: {
            stripeSubscriptionCycle: {
              invoice_pdf: objSub.hosted_invoice_url,
              period_start: new Date(objSub.period_start * 1000),
              period_end: new Date(objSub.period_end * 1000),
              status: objSub.status,
              total: objSub.amount_paid,
            },
          },
        },
      );
      console.log("invoice payment succeeded");
      console.log(parentSubscription);
      break;
    case "invoice.payment_failed":
      const objSubFail = event.data.object;
      const failedSub = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: objSubFail.subscription },
        {
          $push: {
            stripeSubscriptionCycle: {
              invoice_pdf: objSubFail.hosted_invoice_url,
              period_start: new Date(objSubFail.period_start * 1000),
              period_end: new Date(objSubFail.period_end * 1000),
              status: "failed",
              total: objSubFail.amount_paid,
            },
          },
          $set: {
            status: "past_due",
          },
        },
        {
          new: true,
        },
      );
      console.log(failedSub);
      break;

    case "checkout.session.completed":
      const checkoutSessionObj = event.data.object;
      //  when first time payment
      if (checkoutSessionObj.status === "complete") {
        await redisClient.del(
          `checkoutUrl:${checkoutSessionObj.metadata.userId}:${checkoutSessionObj.id}`,
        );
        await redisClient.del(`user:${checkoutSessionObj.metadata.userId}`);

        await Subscription.create({
          planId: checkoutSessionObj.metadata.planId,
          userId: checkoutSessionObj.metadata.userId,
          customerId: checkoutSessionObj.customer,
          startDate: new Date(checkoutSessionObj.created * 1000),
          endDate: new Date(checkoutSessionObj.expires_at * 1000),
          stripeSubscriptionId: checkoutSessionObj.subscription,
          status: "active",
          paymentType: "stripe",
        });

        const user = await User.findByIdAndUpdate(
          checkoutSessionObj.metadata.userId,
          {
            $inc: { maxStorageBytes: checkoutSessionObj.metadata.totalBytes },
            stripeCustomerId: checkoutSessionObj.customer,
          },
        );
        console.log(user);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  console.log(`Webhook received: ${event.type}`);
  res.json({ received: true });
};
