import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CouponFormValues } from "@/pages/admin/coupon/coupon-schema";
import axiosClient from "./axiosClient";

/**
 * fetching all Stripe coupons.
 */
export const useGetAllCoupon = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await axiosClient.get("/payment/coupon");
      return response.data.coupens;
    },
  });
};

/**
 * creating a new Stripe coupon.
 */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: CouponFormValues) => {
      const response = await axiosClient.post("/payment/coupon", couponData);
      return response.data;
    },
    onSuccess: () => {
      // When creation is successful, refetch the coupons list
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};

/**
 * deleting a Stripe coupon.
 */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/payment/coupon/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
};
