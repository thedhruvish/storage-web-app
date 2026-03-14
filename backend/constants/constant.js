export const LOGIN_PROVIDER = ["EAMIL", "GOOGLE", "GITHUB"];
export const SUBSCRIPTION_STATUS = [
  "partial_active",
  "active",
  "cancelled",
  "paused",
  "expired",
  "failed",
  "past_due",
  "refund",
];
export const PAYMENT_GETWAY = ["stripe", "razorpay"];

export const DEFAULT_STORAGE = 806.4 ** 3;

export const UPLOAD_LIMIT = 375 ** 3;

export const SESSION_OPTIONS = {
  httpOnly: true,
  secure: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: "Strict",
  domain: process.env.DOMAIN_NAME
    ? `.${process.env.DOMAIN_NAME}`
    : ".storeone.cloud",
};

export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  signed: true,
  sameSite: "Strict",
  domain: process.env.DOMAIN_NAME
    ? `.${process.env.DOMAIN_NAME}`
    : ".storeone.cloud",
};
export const APP_NAME = "storeone cloud";
export const CLOUDFRONT_PRIVATE_KEY = process.env.CLOUDFRONT_PRIVATE_KEY;
