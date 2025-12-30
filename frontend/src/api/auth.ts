import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RegistrationResponseJSON } from "@simplewebauthn/browser";
import axiosClient from "./axios-client";

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

export const useTwosteupSet = () => {
  return useMutation({
    mutationFn: (data: { method: "totp" | "passkeys" }) =>
      axiosClient.post("/auth/2fa/register/setup", data),
  });
};

export const useTotpVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string; friendlyName: string }) =>
      axiosClient.post("/auth/2fa/register/totp", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const usePasskeysRegistrationVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      response: RegistrationResponseJSON;
      friendlyName: string;
    }) => axiosClient.post("/auth/2fa/register/passkeys", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

/**
 * login for the 2 fa
 */
export const useLoginWithTotp = () => {
  return useMutation({
    mutationFn: (data: { token: string; userId: string }) =>
      axiosClient.post("/auth/2fa/login/totp", data),
  });
};

export const useLoginWithPasskey = () => {
  return useMutation({
    mutationFn: (data: { token: string; userId: string }) =>
      axiosClient.post("/auth/2fa/login/passkey", data),
  });
};
