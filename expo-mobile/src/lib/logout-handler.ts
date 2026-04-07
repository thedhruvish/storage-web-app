import { useUserStore } from "@/store/user-store";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";
import { router } from "expo-router";

let isLoggingOut = false;

export const performLogout = async () => {
  if (isLoggingOut) return;

  isLoggingOut = true;

  // Clear token
  handleToken.deleteToken(AUTH_TOKEN_NAME);

  // Clear store
  useUserStore.getState().logout();

  // Small delay prevents navigation race
  setTimeout(() => {
    router.replace("/(auth)/login");
    isLoggingOut = false;
  }, 100);
};
