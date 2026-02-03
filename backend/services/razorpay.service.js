import { razorpay } from "../lib/razorpay.client.js";
import { getPlanByIdService } from "./billing.service.js";

// create order
export const createRazorpaySubscription = async ({ planId, user, billing }) => {
  const plan = await getPlanByIdService(planId);

  const razorpayPlanId =
    billing === "yearly" ? plan.yearly.razorpayId : plan.monthly.razorpayId;

  const subscription = await razorpay.subscriptions.create({
    plan_id: razorpayPlanId,
    total_count: 100,
    customer_notify: 1,
    notify_info: {
      notify_email: user.email,
      notify_phone: user?.phone,
    },
    quantity: 1,
    notes: {
      userId: user._id,
      planId: planId,
      billing,
    },
  });

  return subscription;
};

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
