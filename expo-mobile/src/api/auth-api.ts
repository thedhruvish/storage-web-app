import { showGlobalDialog } from "@/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import apiClient from "./axios-client";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";

export const authApi = {
  login: async (data: any) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  verifyOtp: async (data: { userId: string; otp: string }) => {
    const response = await apiClient.post("/sso/verify-otp", data);
    return response.data;
  },

  resendOtp: async (userId: string) => {
    const response = await apiClient.post("/sso/resend-otp", { userId });
    return response.data;
  },

  googleLogin: async (idToken: string) => {
    const response = await apiClient.post("/sso/google", { idToken });
    return response.data;
  },
};

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log("Login success:", data);

      if (data.data.sessionId) {
        handleToken.setToken(AUTH_TOKEN_NAME, data.data.sessionId);
        router.replace("/(tabs)");
      } else if (data.data?.is_verfiy_otp) {
        router.push({
          pathname: "/(auth)/otp",
          params: {
            userId: data.data?.userId,
          },
        });
      } else if (data.data.showSetUp2Fa) {
        console.log("two fa authentication");
      }

      // router.replace("/(tabs)");
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
    mutationFn: authApi.register,
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
    mutationFn: authApi.verifyOtp,
    onSuccess: (data) => {
      console.log("OTP verified:", data);
      if (data.data.sessionId) {
        handleToken.setToken(AUTH_TOKEN_NAME, data.data.sessionId);
        router.replace("/(tabs)");
      } else if (data.data?.is_verfiy_otp) {
        router.push({
          pathname: "/(auth)/otp",
          params: {
            userId: data.data?.userId,
          },
        });
      } else if (data.data.showSetUp2Fa) {
        console.log("two fa authentication");
      }
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
export const useResendOtp = () => {
  return useMutation({
    mutationFn: authApi.resendOtp,
  });
};
export function useGoogleLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.googleLogin,
    onSuccess: (data) => {
      console.log("Google login success:", data);
      if (data.data.sessionId) {
        handleToken.setToken(AUTH_TOKEN_NAME, data.data.sessionId);
        router.replace("/(tabs)");
      } else if (data.data?.is_verfiy_otp) {
        router.push({
          pathname: "/(auth)/otp",
          params: {
            userId: data.data?.userId,
          },
        });
      } else if (data.data.showSetUp2Fa) {
        console.log("two fa authentication");
      }
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

// handle the tokens
