import { useMutation, useQuery } from "@tanstack/react-query";
import type { BackendPlan } from "@/pages/other/a";
import axiosClient from "./axios-client";

export const useGetAllPlansPublic = () => {
  return useQuery({
    queryKey: ["plans-public"],
    queryFn: async () => {
      const response = await axiosClient.get<{
        data: { plans: BackendPlan[] };
      }>("/plan/pricing");
      return response.data.data;
    },
  });
};

export const useCheckoutStripe = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.post("/payment/stripe-checkout", {
        id,
      });
      return response.data.data.url;
    },
  });
};
