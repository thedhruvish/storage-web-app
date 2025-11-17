import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlanFormValues } from "@/pages/admin/plan/schema";
import axiosClient from "./axios-client";

// get all the plan
export const useGetAllPlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await axiosClient.get("/plan");
      return response.data.data;
    },
  });
};

// toogle  plan status
export const useTogglePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosClient.put(`/plan/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
};

// create new plan
export const useCreateNewPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PlanFormValues) => {
      const res = await axiosClient.post("/plan", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
};

// delete plan

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await axiosClient.delete(`/plan/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["plans"],
      });
    },
  });
};
