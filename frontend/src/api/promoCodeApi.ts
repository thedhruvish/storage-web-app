import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PromoCodeFormValues } from "@/pages/admin/promo-code/promocode-schema";
import axiosClient from "./axiosClient";

/**
 * fetching all Stripe promotion codes.
 */
export const useGetAllPromoCodes = () => {
  return useQuery({
    queryKey: ["promo-codes"],
    queryFn: async () => {
      const response = await axiosClient.get("/payment/promo-code");
      return response.data.data.promoCode;
    },
  });
};

/**
 * creating a new Stripe promotion code.
 */
export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCodeData: PromoCodeFormValues) => {
      const response = await axiosClient.post(
        "/payment/promo-code",
        promoCodeData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
  });
};

interface TogglePromoCodeData {
  id: string;
  isActive: boolean;
}
/**
 * Toggling a Stripe promotion code's active status.
 */
export const useTogglePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: TogglePromoCodeData) => {
      const response = await axiosClient.patch(`/payment/promo-code/${id}`, {
        isActive,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
  });
};

/**
 * Deleting a Stripe promotion code.
 */
export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/promo-code/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
  });
};
