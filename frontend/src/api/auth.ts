import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (userEmailAndPassword: { email: string; password: string }) =>
      axiosClient.post("/auth/login", userEmailAndPassword),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (userData: { name: string; email: string; password: string }) =>
      axiosClient.post("/auth/register", userData),
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["user-current"],
    queryFn: () => axiosClient.get("/auth/me"),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => axiosClient.post("/auth/logout"),
  });
};
