import Subscription from "../models/Subscription.model.js";
import {
  retrieveStripeSubscription,
  verifyStripeWebhook,
} from "../utils/stripeHelper.js";
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
  console.log(event.data.object);
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
          $set: {
            status: "active",
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
      console.log("checkout completed run");
      console.log(event.data);
      const checkoutSessionObj = event.data.object;
      //  when first time payment
      if (checkoutSessionObj.status === "complete") {
        await redisClient.del(
          `checkoutUrl:${checkoutSessionObj.metadata.userId}:${checkoutSessionObj.id}`,
        );
        await redisClient.del(`user:${checkoutSessionObj.metadata.userId}`);
        const subscription = await retrieveStripeSubscription(
          checkoutSessionObj.subscription,
        );
        console.log(subscription);
        await Subscription.create({
          planId: checkoutSessionObj.metadata.planId,
          userId: checkoutSessionObj.metadata.userId,
          customerId: checkoutSessionObj.customer,
          startDate: new Date(checkoutSessionObj.created * 1000),
          endDate: new Date(
            subscription.items.data[0].current_period_end * 1000,
          ),
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

    case "customer.subscription.updated":
      let subscription = event.data.object;
      const previous = event.data.previous_attributes || {};
      const changedKeys = Object.keys(previous);
      const updateVal = {};

      // Detect cancellation
      if (changedKeys.includes("cancel_at")) {
        if (subscription.cancel_at) {
          // Scheduled or requested cancellation
          updateVal.status = "cancelled";
          updateVal.cancelDate = new Date(subscription.cancel_at * 1000);
        } else {
          // If cancel_at was removed, subscription resumed
          updateVal.status = "active";
          updateVal.cancelDate = null;
        }
      }

      // Detect pause / resume
      if (changedKeys.includes("pause_collection")) {
        if (subscription.pause_collection) {
          // Subscription is paused
          updateVal.isPauseCollection = true;
          updateVal.status = "paused";
        } else {
          // Subscription resumed
          updateVal.isPauseCollection = false;
          updateVal.status = "active";
        }
      }

      if (changedKeys.includes("status")) {
        if (subscription.status === "past_due") {
          updateVal.status = "past_due";
        } else if (subscription.status === "unpaid") {
          updateVal.status = "failed";
        } else if (subscription.status === "active") {
          updateVal.status = "active";
        }
      }

      if (Object.keys(updateVal).length > 0) {
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { $set: updateVal },
          { new: true },
        );
      }

      break;

    case "customer.subscription.deleted":
      subscription = event.data.object;

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        {
          $set: {
            status: "expired",
            isPauseCollection: false,
            cancelDate: subscription.ended_at
              ? new Date(subscription.ended_at * 1000)
              : new Date(),
          },
        },
        { new: true },
      );

      break;
  }

  res.json({ received: true });
};
