/* eslint-disable no-console */
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AxiosError } from "axios";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
// Import the generated route tree
import { toast } from "sonner";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./routeTree.gen";
import { useUserStore } from "./store/userStore.ts";
import "./styles.css";
import { handleServerError } from "./utils/handle-server-error.ts";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// create a new Query instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
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
      staleTime: 10 * 1000, // 10s
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
            router.navigate({ to: "/account-deleted" });
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error("Session expired!");
          useUserStore.getState().clearUser();
          const redirect = `${router.history.location.href}`;
          router.navigate({ to: "/login", search: { redirect } });
        }
        if (error.code === "ERR_NETWORK") {
          toast.error("Server unreachable. Check your internet or backend.");
          router.navigate({ to: "/error/500" });

          return;
        }
        if (error.response?.status === 500) {
          toast.error("Internal Server Error!");
          router.navigate({ to: "/signup" });
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
});
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
