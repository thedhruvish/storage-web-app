import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axios-client";

export const useGetInfoOnSetting = () => {
  return useQuery({
    queryKey: ["settings", "info"],
    queryFn: async () => {
      const response = await axiosClient.get("/user/settings/info");
      return response.data;
    },
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await axiosClient.delete(`/auth/session/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useDeleteTwoFactorMethod = (twoFactorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosClient.delete(`/user/settings/${twoFactorId}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useToggleTwoFactor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (twoFactorId: string) => {
      await axiosClient.put(`/user/settings/2fa/${twoFactorId}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useDangerZone = () => {
  return useMutation({
    mutationFn: async (method: string) => {
      await axiosClient.post(`/user/danger-zone`, { method });
    },
  });
};
