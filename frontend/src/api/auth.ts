import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
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

export const useLogout = () => {
  return useMutation({
    mutationFn: () => axiosClient.post("/sso/logout"),
  });
};

export const useLoginWithGoogle = () => {
  return useMutation({
    mutationFn: (data: { idToken: string }) =>
      axiosClient.post("/sso/google", data),
  });
};

export const useLoginWithGithub = () => {
  return useMutation({
    mutationFn: (data: { hint: "LOGIN" | "LINK"; userId?: string }) =>
      axiosClient.post("/sso/github", data),
  });
};

// verify opt
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (data: { otp: string; userId: string }) =>
      axiosClient.post("/sso/verify-otp", data),
  });
};

// re-send otp
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      axiosClient.post("/sso/resend-otp", data),
  });
};

export const useTwosteupSet = () => {
  return useMutation({
    mutationFn: (data: { method: "totp" | "passkeys" }) =>
      axiosClient.post("/sso/2fa/register/setup", data),
  });
};

export const useTotpVerify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { token: string; friendlyName: string }) =>
      axiosClient.post("/sso/2fa/register/totp", data),
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
    }) => axiosClient.post("/sso/2fa/register/passkeys", data),
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
      axiosClient.post("/sso/2fa/login/totp", data),
  });
};

export const useLoginWithPasskeyChallenge = () => {
  return useMutation({
    mutationFn: (data: { userId: string }) =>
      axiosClient.post("/sso/2fa/login/passkey-challenge", data),
  });
};

export const useLoginWithPasskeyChallengeVerify = () => {
  return useMutation({
    mutationFn: (data: {
      response: AuthenticationResponseJSON;
      userId: string;
    }) => axiosClient.post("/sso/2fa/login/passkey-verify", data),
  });
};

/**
 * link accounts
 */

// send otp to email
export const useSendOtpToEmail = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string; otp: string }) =>
      axiosClient.post("/sso/link/email/verify-otp", data),
  });
};

export const useLinkEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await axiosClient.post("/sso/link/email", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useConnectGoogle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ idToken }: { idToken: string }) => {
      await axiosClient.post(`/sso/link/google`, { idToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useDisconnectLinkedAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      await axiosClient.delete(`/sso/unlink/${data.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id?: string) => {
      await axiosClient.delete(`/sso/session/${id ? id : ""}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "info"] });
    },
  });
};

export const useCreateLinkToken = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await axiosClient.get("/sso/link/create");
      return res.data;
    },
  });
};

export const useCheckLinkToken = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await axiosClient.get(`/sso/link/check/${token}`);
      return res.data;
    },
  });
};
