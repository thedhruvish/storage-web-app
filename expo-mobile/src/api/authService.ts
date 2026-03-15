import { showGlobalDialog } from "@/components/Dialog";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import apiClient from "./axiosClient";

export const authService = {
  login: async (data: any) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (data: { email: string; code: string }) => {
    const response = await apiClient.post("/auth/verify-otp", data);
    return response.data;
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await apiClient.post("/auth/google", { idToken });
    return response.data;
  },
};

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      console.log("Login success:", data);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to login";
      showGlobalDialog({
        title: "Error",
        message: message,
        type: "error",
      });
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      console.log("Registration success:", data);
      router.push("/otp");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to register";
      showGlobalDialog({
        title: "Error",
        message: message,
        type: "error",
      });
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (data) => {
      console.log("OTP verified:", data);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid OTP";
      showGlobalDialog({
        title: "Error",
        message: message,
        type: "error",
      });
    },
  });
}

export function useGoogleLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.googleLogin,
    onSuccess: (data) => {
      console.log("Google login success:", data);
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Google Sign-In failed";
      showGlobalDialog({
        title: "Error",
        message: message,
        type: "error",
      });
    },
  });
}
