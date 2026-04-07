import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axios-client";
import { useUserStore } from "@/store/user-store";
import { handleToken, PUSH_TOKEN } from "@/utils/handle-token";
import { performLogout } from "@/lib/logout-handler";

const STORAGE_SIZE_API_KEY = "storage-used";

export const useUserInfoUpdate = () => {
  return useMutation({
    mutationFn: (data: { name: string }) =>
      axiosClient.patch("/user/update", data),
  });
};

export const usePushToken = () => {
  return useMutation({
    mutationFn: (token: string) => axiosClient.post("/user/push", { token }),
    onSuccess: (_, token) => {
      handleToken.setToken(PUSH_TOKEN, token);
    },
  });
};

export const usePushLogout = () => {
  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        axiosClient.delete("/user/push"),
        axiosClient.post("/sso/logout"),
      ]);
    },
    onSuccess: async () => {
      performLogout();
    },
    onError: async () => {
      performLogout();
    },
  });
};

export const useGenetorAvatarUploadUrl = () => {
  return useMutation({
    mutationFn: (data: { extension: string; contentType: string }) =>
      axiosClient.post("/user/avatar-gen", data),
  });
};

export const getCurrentUser = async () => {
  const response = await axiosClient.get("/sso/me");
  useUserStore.getState().setUser(response.data.data);
  return response.data;
};

export const useGetCurrentUser = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    ...options,
  });
};

export const useGetRealStorage = () => {
  return useQuery({
    queryKey: [STORAGE_SIZE_API_KEY],
    queryFn: async () => {
      const response = await axiosClient.get("/sso/storage");

      return response.data;
    },
  });
};
