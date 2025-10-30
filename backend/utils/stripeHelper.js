import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//  product helper

export const listStripeProduct = async () => {
  const products = await stripe.products.list();
  return products;
};

export const createStripeProduct = async (data) => {
  const product = await stripe.products.create(data);
  return product;
};

export const updateStripeProduct = async (id, data) => {
  const product = await stripe.products.update(id, data);
  return product;
};

export const disableStripeProduct = async (id, active) => {
  const product = await stripe.products.update(id, {
    active,
  });
  return product;
};

export const deleteStripeProduct = async (id) => {
  const product = await stripe.products.del(id);
  return product;
};

// Coupons code

export const listStripeCoupons = async () => {
  const coupons = await stripe.coupons.list();
  return coupons;
};

export const createStripeCoupons = async (data) => {
  const coupon = await stripe.coupons.create(data);
  return coupon;
};

export const updateStripeCoupons = async (id, data) => {
  const coupon = await stripe.coupons.update(id, data);
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

export const createStripePromotionCodes = async (data) => {
  const promotionCode = await stripe.promotionCodes.create(data);
  return promotionCode;
};

export const updateStripePromotionCodes = async (id, data) => {
  const promotionCode = await stripe.promotionCodes.update(id, data);
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
