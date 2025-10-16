import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "./axiosClient";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (userEmailAndPassword: {
      email: string;
      password: string;
      turnstileToken: string;
    }) => axiosClient.post("/auth/login", userEmailAndPassword),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (userData: {
      name: string;
      email: string;
      password: string;
      turnstileToken: string;
    }) => axiosClient.post("/auth/register", userData),
  });
};

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => axiosClient.get("/auth/me"),
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => axiosClient.post("/auth/logout"),
  });
};

export const useLoginWithGoogle = () => {
  return useMutation({
    mutationFn: (data: { idToken: string }) =>
      axiosClient.post("/auth/google", data),
  });
};

// verify opt
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { otp: string; userId: string }) =>
      axiosClient.post("/auth/otp-verify", data),
  });
};

// re-send otp
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      axiosClient.post("/auth/resend-otp", data),
  });
};
