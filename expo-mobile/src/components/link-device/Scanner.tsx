import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { showGlobalDialog } from "@/components/dialog";
import Animated, { FadeOut, ZoomIn, FadeIn } from "react-native-reanimated";
import { useTokenVerifyForLink } from "@/api/auth-api";
import { useCameraPermission } from "@/hooks/use-camera-permission";

interface ScannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const Scanner = ({ isVisible, onClose }: ScannerProps) => {
  const { colors } = useTheme();
  const { permission, requestPermission, isGranted } = useCameraPermission();
  const [scanned, setScanned] = useState(false);
  const { mutate: mutateVerify, isPending } = useTokenVerifyForLink();

  React.useEffect(() => {
    if (isVisible && (!permission || permission.status === "undetermined")) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, permission]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned || isPending) return;
    setScanned(true);

    // Extract token from URL like https://links.example.com/link-devices?token=thisistoken
    try {
      const urlObj = new URL(data);
      const token = urlObj.searchParams.get("token");

      if (!token) {
        showGlobalDialog({
          title: "Invalid QR Code",
          message: "The scanned QR code is not valid for device linking.",
          type: "error",
        });
        setTimeout(() => setScanned(false), 2000);
        return;
      }

      mutateVerify(token, {
        onSuccess: () => {
          showGlobalDialog({
            title: "Device Linked",
            message:
              "Successfully linked your device. You can now access your account from the new device.",
            type: "success",
            onConfirm: () => {
              setScanned(false);
              onClose();
            },
          });
        },
        onError: (error: any) => {
          if (error.response?.status === 404) {
            showGlobalDialog({
              title: "Link Expired",
              message:
                "The QR code has expired or is invalid. Please refresh your website to get a new QR code and try again.",
              type: "error",
            });
          } else {
            showGlobalDialog({
              title: "Error",
              message:
                error.response?.data?.message ||
                "Failed to link device. Please try again.",
              type: "error",
            });
          }
          setTimeout(() => setScanned(false), 2000);
        },
      });
    } catch {
      showGlobalDialog({
        title: "Invalid QR Code",
        message: "The scanned QR code is not valid.",
        type: "error",
      });
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={ZoomIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <Text weight="bold" variant="h3">
              Scan QR Code
            </Text>
            <TouchableOpacity
              onPress={onClose}
              disabled={isPending}
              style={[styles.closeButton, isPending && { opacity: 0.5 }]}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            {isGranted ? (
              <View style={StyleSheet.absoluteFill}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                >
                  <View style={styles.scannerOverlay}>
                    <View
                      style={[
                        styles.corner,
                        styles.topLeft,
                        { borderColor: colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.topRight,
                        { borderColor: colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.bottomLeft,
                        { borderColor: colors.primary },
                      ]}
                    />
                    <View
                      style={[
                        styles.corner,
                        styles.bottomRight,
                        { borderColor: colors.primary },
                      ]}
                    />
                  </View>
                </CameraView>

                {isPending && (
                  <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={styles.loadingOverlay}
                  >
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text
                      weight="bold"
                      style={{ marginTop: 16, color: "white" }}
                    >
                      Linking Device...
                    </Text>
                  </Animated.View>
                )}
              </View>
            ) : (
              <View
                style={[
                  styles.permissionContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={64}
                  color={colors.secondaryText}
                />
                <Text
                  style={{ marginTop: 16, textAlign: "center" }}
                  color="secondaryText"
                >
                  Camera permission is required to scan the QR code.
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={requestPermission}
                >
                  <Text weight="bold" style={{ color: "white" }}>
                    Grant Permission
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text
              variant="bodySmall"
              color="secondaryText"
              style={{ textAlign: "center" }}
            >
              Center the QR code within the frame to scan.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    aspectRatio: 1,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: 40,
    left: 40,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 40,
    right: 40,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 40,
    left: 40,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 40,
    right: 40,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  footer: {
    padding: 20,
  },
});
