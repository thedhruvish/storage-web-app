import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, Linking, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { showGlobalDialog } from "@/components/dialog";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";

interface ScannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const Scanner = ({ isVisible, onClose }: ScannerProps) => {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  React.useEffect(() => {
    if (isVisible && (!permission || permission.status === "undetermined")) {
      requestPermission();
    }
  }, [isVisible, permission]);

  const handleScan = async () => {
    const { status } = await requestPermission();
    if (status !== "granted") {
      showGlobalDialog({
        title: "Camera Permission",
        message: "We need your permission to use the camera to scan the QR code. Please enable it in your device settings.",
        type: "info",
        confirmText: "Open Settings",
        onConfirm: () => {
          if (Platform.OS === "ios") {
            Linking.openURL("app-settings:");
          } else {
            Linking.openSettings();
          }
        }
      });
      return;
    }
  };

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    console.log(`Scanned URL: ${data}`);
    
    showGlobalDialog({
      title: "Device Linked",
      message: `Successfully scanned: ${data}. Linking process started.`,
      type: "success",
      onConfirm: onClose
    });

    // Reset scanned state after a delay or upon closing
    setTimeout(() => setScanned(false), 2000);
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
            <Text weight="bold" variant="h3">Scan QR Code</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              >
                <View style={styles.scannerOverlay}>
                  <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
                  <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
                  <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
                  <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
                </View>
              </CameraView>
            ) : (
              <View style={[styles.permissionContainer, { backgroundColor: colors.card }]}>
                <Ionicons name="camera-outline" size={64} color={colors.secondaryText} />
                <Text style={{ marginTop: 16, textAlign: "center" }} color="secondaryText">
                  Camera permission is required to scan the QR code.
                </Text>
                <TouchableOpacity 
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleScan}
                >
                  <Text weight="bold" style={{ color: "white" }}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text variant="bodySmall" color="secondaryText" style={{ textAlign: "center" }}>
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
