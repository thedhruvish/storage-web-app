import { useCameraPermissions } from "expo-camera";
import { useCallback } from "react";
import { Linking, Platform } from "react-native";
import { showGlobalDialog } from "@/components/dialog";

export const useCameraPermission = () => {
  const [permission, requestPermission] = useCameraPermissions();

  const checkAndRequestPermission = useCallback(async () => {
    const { status, canAskAgain } = await requestPermission();

    if (status === "granted") {
      return true;
    }

    if (!canAskAgain || status === "denied") {
      showGlobalDialog({
        title: "Camera Permission",
        message:
          "We need your permission to use the camera to scan the QR code. Please enable it in your device settings.",
        type: "info",
        confirmText: "Open Settings",
        onConfirm: () => {
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
        },
      });
      return false;
    }

    return false;
  }, [requestPermission]);

  return {
    permission,
    requestPermission: checkAndRequestPermission,
    isGranted: permission?.granted ?? false,
    status: permission?.status ?? "undetermined",
  };
};
