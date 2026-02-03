import { razorpay } from "../lib/razorpay.client.js";

// Create a plan
export const createRazorpayPlan = async ({
  name,
  description,
  amount,
  interval,
  notes,
}) => {
  const plan = await razorpay.plans.create({
    period: interval === "month" ? "monthly" : "yearly",
    interval: 1,
    item: {
      name,
      amount: amount * 100,
      currency: "INR",
      description,
    },
    notes,
  });
  return plan;
};

// Create a subscription
export const createRazorpaySubscription = async ({
  planId,
  total_count = 120,
  customerNotify = 1,
}) => {
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count,
    customer_notify: customerNotify,
    quantity: 1,
  });
  return subscription;
};

// Cancel a subscription
export const cancelRazorpaySubscription = async (subscriptionId) => {
  const subscription = await razorpay.subscriptions.cancel(subscriptionId);
  return subscription;
};

// Retrieve a subscription
export const retrieveRazorpaySubscription = async (subscriptionId) => {
  const subscription = await razorpay.subscriptions.fetch(subscriptionId);
  return subscription;
};

export const pauseRazorpaySubscription = async (subscriptionId) => {
  const subscription = await razorpay.subscriptions.update(subscriptionId, {
    status: "paused",
  });
  return subscription;
};

export const resumeRazorpaySubscription = async (subscriptionId) => {
  const subscription = await razorpay.subscriptions.update(subscriptionId, {
    status: "active",
  });
  return subscription;
};