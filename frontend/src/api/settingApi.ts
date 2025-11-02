import { useQuery } from "@tanstack/react-query";
import type { Plan } from "@/pages/admin/plan/schema";
import axiosClient from "./axiosClient";

/**
 * This type matches the Subscription object
 * from your API response.
 */
export type ApiSubscription = {
  _id: string;
  userId: string;
  planId: Plan;
  status: "active" | "cancelled" | "paused" | "expired";
  startDate: string; // API sends strings, not Date objects
  endDate: string; // API sends strings, not Date objects
  subscriptionId: string;
  paymentType: "stripe" | "razorpay";
  __v: 0;
  cancelDate?: string;
  customerId?: string;
};

/**
 * This is the shape of the full API response
 * from your backend.
 */
export type SubscriptionsApiResponse = {
  statusCode: number;
  message: string;
  data: ApiSubscription[]; // This is the array of subscriptions
  success: boolean;
};

export const useGetAllSubscriptions = () => {
  return useQuery({
    queryKey: ["settings", "subscription"],
    queryFn: async () => {
      // Use the SubscriptionsApiResponse type for the GET request
      const response = await axiosClient.get<SubscriptionsApiResponse>(
        "/user/subscriptions"
      );

      // The subscriptions array is in response.data.data
      return response.data.data;
    },
  });
};
