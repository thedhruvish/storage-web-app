import Subscription from "../models/Subscription.model.js";
import User from "../models/User.model.js";
import Plan from "../models/Plan.model.js";

const updateUserStorage = async (subscription, operation) => {
  if (!subscription) return;

  const plan = await Plan.findById(subscription.planId);
  if (!plan) return;

  const update =
    operation === "add"
      ? { $inc: { maxStorageBytes: plan.totalBytes } }
      : { $inc: { maxStorageBytes: -plan.totalBytes } };

  await User.findByIdAndUpdate(subscription.userId, update);
};

export const handleSubscriptionActivated = async (event) => {
  const subscription = event.payload.subscription.entity;
  await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId: subscription.id,
    },
    {
      status: "active",
      isActive: true,
    },
  );
};

export const handleSubscriptionCompleted = async (event) => {
  const subscription = event.payload.subscription.entity;
  const sub = await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId: subscription.id,
    },
    {
      status: "expired",
      isActive: false,
    },
  );
  await updateUserStorage(sub, "remove");
};

export const handleSubscriptionCancelled = async (event) => {
  const subscription = event.payload.subscription.entity;
  const sub = await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId: subscription.id,
    },
    {
      status: "cancelled",
      cancelDate: new Date(),
      isActive: false,
    },
  );
  await updateUserStorage(sub, "remove");
};

export const handleSubscriptionPaused = async (event) => {
  const subscription = event.payload.subscription.entity;
  const sub = await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId: subscription.id,
    },
    {
      status: "paused",
      isPauseCollection: true,
    },
  );
  await updateUserStorage(sub, "remove");
};

export const handleSubscriptionResumed = async (event) => {
  const subscription = event.payload.subscription.entity;
  const sub = await Subscription.findOneAndUpdate(
    {
      razorpaySubscriptionId: subscription.id,
    },
    {
      status: "active",
      isPauseCollection: false,
    },
  );
  await updateUserStorage(sub, "add");
};

export const handleInvoicePaid = async (event) => {
  const invoice = event.payload.invoice.entity;
  const subscriptionId = invoice.subscription_id;

  if (subscriptionId) {
    await Subscription.findOneAndUpdate(
      {
        razorpaySubscriptionId: subscriptionId,
      },
      {
        status: "active",
        startDate: new Date(invoice.billing_start * 1000),
        endDate: new Date(invoice.billing_end * 1000),
      },
    );
  }
};

export const handleInvoicePaymentFailed = async (event) => {
  const invoice = event.payload.invoice.entity;
  const subscriptionId = invoice.subscription_id;

  if (subscriptionId) {
    await Subscription.findOneAndUpdate(
      {
        razorpaySubscriptionId: subscriptionId,
      },
      {
        status: "past_due",
      },
    );
  }
};
