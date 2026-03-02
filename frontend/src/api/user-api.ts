import { useMutation, useQuery } from "@tanstack/react-query";
import { STORAGE_SIZE_API_KEY } from "@/contansts";
import axiosClient from "./axios-client";

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

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => axiosClient.get("/sso/me"),
  });
};

export const useGetRealStorage = () => {
  return useQuery({
    queryKey: [STORAGE_SIZE_API_KEY],
    queryFn: async () => {
      const response = await axiosClient.get("/sso/storage");
      import("@/store/storage-store").then(({ useStorageStore }) => {
        useStorageStore.getState().setTotalUsedBytes(response.data.data.size);
      });
      return response;
    },
  });
};
