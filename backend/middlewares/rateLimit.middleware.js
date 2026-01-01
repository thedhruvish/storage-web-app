import { rateLimit } from "express-rate-limit";

export const rateLimiter = ({
  minutes = 1000 * 60,
  maxLimit = 10,
  message = "Too many requests , please try again after few minutes",
}) => {
  return rateLimit({
    windowMs: minutes, // minutes
    limit: maxLimit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: true, //`X-RateLimit-*` headers
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    message,
  });
};
