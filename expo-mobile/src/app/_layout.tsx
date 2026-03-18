import { DialogProvider } from "@/components/dialog";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/hooks/use-theme";
import { AppState, Platform } from "react-native";
import { useEffect } from "react";
import { useBackExit } from "@/hooks/use-back-exit";

export default function RootLayout() {
  const { isDark, colors } = useTheme();
  useBackExit();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active");
      }
    });

    return () => subscription.remove();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </DialogProvider>
    </QueryClientProvider>
  );
}
