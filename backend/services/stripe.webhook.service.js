import Subscription from "../models/Subscription.model.js";
import WebHookLog from "../models/WebHookLog.model.js";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// verify webhook stripe
export const verifyStripeWebhook = async (req) => {
  const signature = req.headers["stripe-signature"];

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    endpointSecret,
  );
  return event;
};

// webhook event
const handleInvoiceSuccess = async (event) => {
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
        isActive: true,
      },
    },
    { new: true },
  ).populate("planId");

  if (parentSubscription) {
    await redisClient.del(`user:${parentSubscription.userId}`);

    await User.findByIdAndUpdate(
      parentSubscription.userId,
      {
        $inc: {
          maxStorageBytes: parentSubscription.planId.totalBytes,
        },
        $set: {
          dueDeleteDate: null,
        },
      },
      { new: true },
    );
  }
};

const handleInvoiceFailed = async (event) => {
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
};
const handleCheckoutCompleted = async (event) => {
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

    await Subscription.create({
      planId: checkoutSessionObj.metadata.planId,
      userId: checkoutSessionObj.metadata.userId,
      customerId: checkoutSessionObj.customer,
      startDate: new Date(checkoutSessionObj.created * 1000),
      endDate: new Date(subscription.items.data[0].current_period_end * 1000),
      stripeSubscriptionId: checkoutSessionObj.subscription,
      status: "active",
      paymentType: "stripe",
    });

    const user = await User.findByIdAndUpdate(
      checkoutSessionObj.metadata.userId,
      {
        $inc: {
          maxStorageBytes: checkoutSessionObj.metadata.totalBytes,
        },
        stripeCustomerId: checkoutSessionObj.customer,
        dueDeleteDate: null,
      },
    );
  }
};

const handleSubscriptionUpdated = async (event) => {
  subscription = event.data.object;
  const previous = event.data.previous_attributes || {};
  const changedKeys = Object.keys(previous);
  const updateVal = {};

  if (changedKeys.includes("cancel_at")) {
    if (subscription.cancel_at) {
      updateVal.status = "cancelled";
      updateVal.cancelDate = new Date(subscription.cancel_at * 1000);

      updateVal.isActive = false;
      updateVal.serviceStoppedAt = new Date();
    } else {
      updateVal.status = "active";
      updateVal.cancelDate = null;
      updateVal.isActive = true;
    }
  }

  if (changedKeys.includes("pause_collection")) {
    if (subscription.pause_collection) {
      updateVal.isPauseCollection = true;
      updateVal.status = "paused";
      updateVal.isActive = false;
      updateVal.serviceStoppedAt = new Date();
    } else {
      updateVal.isPauseCollection = false;
      updateVal.status = "active";
      updateVal.isActive = true;
    }
  }

  if (changedKeys.includes("status")) {
    if (subscription.status === "past_due") {
      updateVal.status = "past_due";
    } else if (
      subscription.status === "unpaid" ||
      subscription.status === "incomplete_expired"
    ) {
      updateVal.status = "failed";
      updateVal.isActive = false;
      updateVal.serviceStoppedAt = new Date();
    } else if (subscription.status === "canceled") {
      updateVal.status = "cancelled";
      updateVal.isActive = false;
      updateVal.serviceStoppedAt = new Date();
    } else if (subscription.status === "active") {
      updateVal.status = "active";
      updateVal.isActive = true;
    }
  }

  if (Object.keys(updateVal).length > 0) {
    const subscriptionUpdate = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      { $set: updateVal },
      { new: true },
    ).populate("planId");

    await redisClient.del(`user:${subscriptionUpdate.userId}`);

    if (subscriptionUpdate.isActive === false) {
      await User.findByIdAndUpdate(subscriptionUpdate.userId, {
        $inc: {
          maxStorageBytes: -subscriptionUpdate.planId.totalBytes,
        },
        $set: {
          dueDeleteDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        },
      });
    }

    if (subscriptionUpdate.isActive === true) {
      await User.findByIdAndUpdate(subscriptionUpdate.userId, {
        $inc: {
          maxStorageBytes: subscriptionUpdate.planId.totalBytes,
        },
        $set: { dueDeleteDate: null },
      });
    }
  }
};
const handleSubscriptionDeleted = async (event) => {
  subscription = event.data.object;

  const olderSubscription = await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      $set: {
        status: "expired",
        isActive: false,
        isPauseCollection: false,
        cancelDate: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : new Date(),
      },
    },
    { new: true },
  ).populate("planId");

  await redisClient.del(`user:${olderSubscription.userId}`);

  await User.findByIdAndUpdate(
    olderSubscription.userId,
    {
      $inc: {
        maxStorageBytes: -olderSubscription.planId.maxStorageBytes,
      },
      $set: {
        dueDeleteDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    },
    {
      new: true,
    },
  );
};

export const handleStripeWebhookEvent = async (event) => {
  await WebHookLog.create({
    type: event.type,
    data: event.data,
    paymentType: "stripe",
  });

  switch (event.type) {
    case "invoice.payment_succeeded":
      return handleInvoiceSuccess(event);

    case "invoice.payment_failed":
      return handleInvoiceFailed(event);

    case "checkout.session.completed":
      return handleCheckoutCompleted(event);

    case "customer.subscription.updated":
      return handleSubscriptionUpdated(event);

    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(event);

    default:
      return;
  }
};
