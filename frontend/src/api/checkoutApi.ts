import { useMutation, useQuery } from "@tanstack/react-query";
import type { BackendPlan } from "@/pages/other/PricingCard";
import axiosClient from "./axiosClient";

export const useGetAllPlansPublic = () => {
  return useQuery({
    queryKey: ["plans-public"],
    queryFn: async () => {
      const response = await axiosClient.get<{
        data: { plans: BackendPlan[] };
      }>("/plan/pricing");
      return response.data.data.plans;
    },
  });
};

