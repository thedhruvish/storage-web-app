import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axios-client";

const STORAGE_SIZE_API_KEY = "storage-used";

export const useUserInfoUpdate = () => {
  return useMutation({
    mutationFn: (data: { name: string }) =>
      axiosClient.patch("/user/update", data),
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

      return response;
    },
  });
};
