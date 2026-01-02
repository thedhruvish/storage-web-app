import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//  product helper

export const listStripeProduct = async () => {
  const products = await stripe.products.list();
  return products;
};

export const createStripeProduct = async ({
  title,
  isActive,
  description,
  interval,
  priceUSD,
  metadata,
}) => {
  const product = await stripe.products.create({
    name: title,
    active: isActive,
    description,
    default_price_data: {
      currency: "USD",
      unit_amount: priceUSD * 100,
      recurring: {
        interval,
        interval_count: 1,
      },
    },
    shippable: false,
    metadata,
  });

  return product;
};

export const disableStripeProduct = async (id, active) => {
  const product = await stripe.products.update(id, {
    active,
  });
  return product;
};

export const deleteStripeProduct = async (pid, priceId) => {
  await stripe.products.update(pid, {
    active: false,
  });

  const product = await stripe.products.del(pid);
  return product;
};

// Coupons code

export const listStripeCoupons = async () => {
  const coupons = await stripe.coupons.list();
  return coupons;
};

export const createStripeCoupons = async ({ amount_off, percent_off, id }) => {
  const coupon = await stripe.coupons.create({
    amount_off,
    percent_off,
    currency: "USD",
    duration: "forever",
    id,
  });
  return coupon;
};

export const deleteStripeCoupons = async (id) => {
  const coupon = await stripe.coupons.del(id);
  return coupon;
};

// Promotion Codes

export const listStripePromotionCodes = async () => {
  const promotionCodes = await stripe.promotionCodes.list();
  return promotionCodes;
};

export const createStripePromotionCode = async ({
  couponCode,
  code,
  expires_at,
  customer,
  metadata,
  isActive,
  max_redemptions,
}) => {
  const promotionCode = await stripe.promotionCodes.create({
    promotion: {
      type: "coupon",
      coupon: couponCode,
    },
    active: isActive,
    code,
    expires_at,
    customer,
    metadata,
    max_redemptions,
  });
  return promotionCode;
};

export const toggleStripePromotionCodes = async (id, active) => {
  const promotionCode = await stripe.promotionCodes.update(id, {
    active,
  });
  return promotionCode;
};

//  Checkout session  subscription create
export const createStripeCheckoutSession = async ({
  priceId,
  metadata,
  customer_email,
}) => {
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: process.env.STRIPE_PAYMENT_SUCCESS_URL,
    metadata,
    customer_email,
  });
  return checkoutSession;
};

// pause subscription

export const pauseStripeSubscription = async (id) => {
  const subscription = await stripe.subscriptions.update(id, {
    pause_collection: {
      behavior: "mark_uncollectible",
    },
  });
  return subscription;
};
export const retrieveStripeSubscription = async (id) => {
  const subscription = await stripe.subscriptions.retrieve(id);
  return subscription;
};
// resume subscription

export const resumeStripeSubscription = async (id) => {
  const subscription = await stripe.subscriptions.update(id, {
    pause_collection: null,
  });
  return subscription;
};

export const createCustomerPortalSession = async (id) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: id,
    return_url: process.env.STRIPE_PORTAL_RETURN_URL,
  });

  return session;
};
