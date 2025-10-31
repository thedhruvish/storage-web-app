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
  const remove = await stripe.products.update(pid, {
    active: false,
  });
  console.log(remove);
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

export const deleteStripePromotionCodes = async (id) => {
  const promotionCode = await stripe.promotionCodes.del(id);
  return promotionCode;
};

//  Checkout session  subscription create
export const createStripeCheckoutSession = async (data) => {
  const checkoutSession = await stripe.checkout.sessions.create(data);
  return checkoutSession;
};
