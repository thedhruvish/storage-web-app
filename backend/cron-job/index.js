import { removeSubscriptionExpiryData } from "./remove-subscription-expiry-data.js";

export const startCronJobs = () => {
  removeSubscriptionExpiryData();
};
