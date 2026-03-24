import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "./axios-client";
import { useUserStore } from "@/store/user-store";
import { AUTH_TOKEN_NAME, handleToken, PUSH_TOKEN } from "@/utils/handle-token";
import { useRouter } from "expo-router";

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
  const router = useRouter();
  const { logout: clearStore } = useUserStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await Promise.all([
        axiosClient.delete("/user/push"),
        axiosClient.post("/sso/logout"),
      ]);
    },
    onSuccess: async () => {
      handleToken.deleteToken(AUTH_TOKEN_NAME);
      handleToken.deleteToken(PUSH_TOKEN);
      clearStore();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
    onError: async (error: any) => {
      console.error("Logout failed:", error);
      handleToken.deleteToken(AUTH_TOKEN_NAME);
      handleToken.deleteToken(PUSH_TOKEN);
      clearStore();
      queryClient.clear();
      router.replace("/(auth)/login");
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
