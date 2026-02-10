export const LOGIN_PROVIDER = ["EAMIL", "GOOGLE", "GITHUB"];
export const SUBSCRIPTION_STATUS = [
  "partial_active",
  "active",
  "cancelled",
  "paused",
  "expired",
  "failed",
  "past_due",
];
export const PAYMENT_GETWAY = ["stripe", "razorpay"];

export const DEFAULT_STORAGE = 1024 ** 3;

export const SESSION_OPTIONS = {
  httpOnly: true,
  secure: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000,
};
