import { DialogProvider } from "@/components/dialog";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/hooks/use-theme";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme } = useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <DialogProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </DialogProvider>
    </QueryClientProvider>
  );
}
