import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axios-client";

export const useGetAllPlansPublic = () => {
  return useQuery({
    queryKey: ["plans-public"],
    queryFn: async () => {
      const response = await axiosClient.get("/plan/pricing");
      return response.data.data;
    },
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: async ({
      id,
      billing,
      provider,
    }: {
      id: string;
      billing: string;
      provider: string;
    }) => {
      const response = await axiosClient.post(`/payment/${provider}-checkout`, {
        id,
        billing,
      });
      return response.data.data;
    },
  });
};
