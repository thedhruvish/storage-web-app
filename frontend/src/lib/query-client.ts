import { AxiosError } from "axios";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user-store";
import { toast } from "sonner";
import { handleServerError } from "@/utils/handle-server-error";

const navigateTo = (path: string) => {
  window.location.href = path;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error });

        // ❌ Don't retry on auth errors
        if (
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        ) {
          return false;
        }

        // ❌ Don't retry too many times
        if (import.meta.env.DEV && failureCount >= 0) return false;
        if (import.meta.env.PROD && failureCount > 3) return false;

        // ✅ Retry otherwise
        return true;
      },

      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
      retryDelay: 5000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        if (error instanceof AxiosError) {
          if (error.code === "ERR_NETWORK") {
            toast.error("Cannot connect to server. Please try again later.");
            return;
          }
          if (error.response?.status === 304) {
            toast.error("Content not modified!");
          }
          if (error.request?.status === 409) {
            navigateTo("/account-deleted");
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403) {
          toast.error("Session expired!");
          useUserStore.getState().clearUser();
          // Simple browser redirect ensures a clean state reset
          navigateTo(
            "/auth/login?redirect=" + encodeURIComponent(window.location.href)
          );
        }
        if (error.code === "ERR_NETWORK") {
          toast.error("Server unreachable.");
          // navigateTo("/error/500"); // Optional
          return;
        }
        if (error.response?.status === 500) {
          toast.error("Internal Server Error!");
        }
      }
    },
  }),
});
