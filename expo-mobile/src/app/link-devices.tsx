import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { showGlobalDialog } from "@/components/dialog";
import { useTokenVerifyForLink } from "@/api/auth-api";
import { useTheme } from "@/hooks/use-theme";
import { AUTH_TOKEN_NAME, handleToken } from "@/utils/handle-token";
import { Scanner } from "@/components/link-device/Scanner";
import { Text } from "@/components/ui";

export default function LinkDevicesScreen() {
  const { token: initialToken } = useLocalSearchParams<{ token: string }>();
  const { mutate: mutateVerify, isPending } = useTokenVerifyForLink();
  const { colors } = useTheme();
  const router = useRouter();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthAndHandleToken = async () => {
      const authToken = handleToken.getToken(AUTH_TOKEN_NAME);

      if (!authToken) {
        setIsCheckingAuth(false);
        showGlobalDialog({
          title: "Login Required",
          message: "You need to be logged in to link this device.",
          type: "info",
          onConfirm: () => {
            router.replace({
              pathname: "/(auth)/login",
              params: { redirectTo: "/link-devices", token: initialToken },
            });
          },
        });
        return;
      }

      if (initialToken) {
        setIsCheckingAuth(false);
        showGlobalDialog({
          title: "Link Device",
          message: "Do you want to login and link this device?",
          type: "info",
          confirmText: "Yes, Link",
          cancelText: "Cancel",
          onConfirm: () => handleVerify(initialToken),
          onCancel: () => router.replace("/(tabs)"),
        });
      } else {
        // No token provided via deep link, open scanner
        setIsCheckingAuth(false);
        setIsScannerVisible(true);
      }
    };

    checkAuthAndHandleToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleVerify = (tokenValue: string) => {
    mutateVerify(tokenValue, {
      onSuccess: () => {
        showGlobalDialog({
          title: "Device Linked",
          message:
            "Successfully linked your device. You can now access your account from the new device.",
          type: "success",
          onConfirm: () => router.replace("/(tabs)"),
        });
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          "Failed to link device. Please try again.";
        if (error.response?.status === 404) {
          showGlobalDialog({
            title: "Link Expired",
            message:
              "The link has expired or is invalid. Please refresh your website to get a new QR code and try again.",
            type: "error",
            onConfirm: () => router.replace("/(tabs)"),
          });
        } else {
          showGlobalDialog({
            title: "Error",
            message: message,
            type: "error",
            onConfirm: () => router.replace("/(tabs)"),
          });
        }
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Stack.Screen
        options={{ title: "Linking Device...", headerShown: false }}
      />

      {(isPending || isCheckingAuth) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16 }} color="secondaryText">
            {isCheckingAuth
              ? "Checking authentication..."
              : "Linking device..."}
          </Text>
        </View>
      )}

      <Scanner
        isVisible={isScannerVisible}
        onClose={() => {
          setIsScannerVisible(false);
          router.replace("/(tabs)");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
