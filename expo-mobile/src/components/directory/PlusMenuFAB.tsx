import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "../ui";
import { CreateFolderDialog } from "./CreateFolderDialog";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { uploadFiles } from "@/store/upload-store";
import { useUserStore } from "@/store/user-store";
import { showGlobalDialog } from "@/components/dialog";
import { useCreateDirectory } from "@/api/directory-api";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

interface PlusMenuFABProps {
  directoryId?: string;
  isSelectionMode: boolean;
  showCamera?: boolean;
}

export const PlusMenuFAB = ({
  directoryId = "",
  isSelectionMode,
  showCamera = false,
}: PlusMenuFABProps) => {
  const { colors } = useTheme();
  const { user } = useUserStore();
  const [isPlusMenuVisible, setIsPlusMenuVisible] = useState(false);
  const [isCreateFolderVisible, setIsCreateFolderVisible] = useState(false);

  const createDirectoryMutation = useCreateDirectory(directoryId);

  const handleCameraLaunch = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        showGlobalDialog({
          title: "Permission Required",
          message: "Camera permission is required to take photos.",
          type: "warning",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        // Format the asset to match DocumentPickerAsset style for uploadFiles
        const cameraAsset: any = {
          uri: asset.uri,
          name: asset.fileName || `camera_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.mimeType || "image/jpeg",
        };

        // Check for upload limit
        if (user && cameraAsset.size > user.uploadLimit) {
          showGlobalDialog({
            title: "Upload Limit Exceeded",
            message: `Your upload limit is ${Math.round(
              user.uploadLimit / (1024 * 1024),
            )}MB. This photo is ${Math.round(
              cameraAsset.size / (1024 * 1024),
            )}MB.`,
            type: "error",
          });
          return;
        }

        uploadFiles([cameraAsset], directoryId);
      }
    } catch (err) {
      console.error("Error launching camera:", err);
    }
  };

  const handleUploadFiles = async () => {
    setIsPlusMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "*/*",
      });

      if (!result.canceled) {
        const totalSize = result.assets.reduce(
          (acc, asset) => acc + (asset.size || 0),
          0,
        );
        if (user && totalSize > user.uploadLimit) {
          showGlobalDialog({
            title: "Upload Limit Exceeded",
            message: `Your upload limit is ${Math.round(
              user.uploadLimit / (1024 * 1024),
            )}MB. The selected files are ${Math.round(
              totalSize / (1024 * 1024),
            )}MB.`,
            type: "error",
          });
          return;
        }

        uploadFiles(result.assets, directoryId);
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const handleCreateFolder = (name: string) => {
    createDirectoryMutation.mutate({ data: { name } });
  };

  if (isSelectionMode) return null;

  return (
    <>
      <View style={styles.fabContainer}>
        {showCamera && (
          <TouchableOpacity
            onPress={handleCameraLaunch}
            style={[
              styles.fabSecondary,
              { backgroundColor: colors.secondaryBackground },
            ]}
          >
            <MaterialIcons name="camera-alt" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setIsPlusMenuVisible(true)}
          style={[styles.fabPrimary, { backgroundColor: "#443a34" }]}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Plus Menu Modal */}
      <Modal
        visible={isPlusMenuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setIsPlusMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPlusMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={[styles.plusMenu, { backgroundColor: colors.background }]}
            >
              <TouchableOpacity
                style={styles.plusMenuItem}
                onPress={() => {
                  setIsPlusMenuVisible(false);
                  setIsCreateFolderVisible(true);
                }}
              >
                <View
                  style={[
                    styles.plusMenuIcon,
                    { backgroundColor: colors.secondaryBackground },
                  ]}
                >
                  <MaterialIcons
                    name="create-new-folder"
                    size={24}
                    color={colors.text}
                  />
                </View>
                <Text variant="body">Create Folder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.plusMenuItem}
                onPress={handleUploadFiles}
              >
                <View
                  style={[
                    styles.plusMenuIcon,
                    { backgroundColor: colors.secondaryBackground },
                  ]}
                >
                  <MaterialIcons
                    name="file-upload"
                    size={24}
                    color={colors.text}
                  />
                </View>
                <Text variant="body">Upload Files</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <CreateFolderDialog
        visible={isCreateFolderVisible}
        onClose={() => setIsCreateFolderVisible(false)}
        onConfirm={handleCreateFolder}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 16,
    alignItems: "center",
  },
  fabPrimary: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 16,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  plusMenu: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 16,
  },
  plusMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  plusMenuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
