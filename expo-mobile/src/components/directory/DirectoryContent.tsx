import React, { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui";
import { FileGrid } from "./FileGrid";
import { useAppearance } from "@/store/appearance-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import type { FileItem } from "./types";
import { useFilePreview } from "@/hooks/use-file-preview";
import { FilePreviewModal } from "./FilePreviewModal";
import { FileSkeleton } from "./FileSkeleton";

interface DirectoryContentProps {
  files: { directories?: FileItem[]; documents?: FileItem[] };
  isLoading: boolean;
  isError: boolean;
  onFileDoubleClick: (file: FileItem) => void;
  onMenuPress?: (file: FileItem) => void;
  emptyMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export const DirectoryContent = ({
  files,
  isLoading,
  isError,
  onFileDoubleClick,
  onMenuPress,
  emptyMessage = "This folder is empty",
  onRefresh,
  refreshing = false,
}: DirectoryContentProps) => {
  const { directoryLayout } = useAppearance();
  const { colors } = useTheme();

  const { previewFile, isPreviewVisible, handlePreview, closePreview } =
    useFilePreview();

  const handlePress = useCallback(
    (file: FileItem) => {
      if (file.extension) {
        handlePreview(file);
      } else {
        onFileDoubleClick(file);
      }
    },
    [onFileDoubleClick, handlePreview],
  );

  const isEmpty = !files?.directories?.length && !files?.documents?.length;

  if (isLoading) {
    return <FileSkeleton viewMode={directoryLayout} />;
  }

  if (isError) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text
          variant="body"
          style={[styles.errorText, { color: colors.error }]}
        >
          Error loading content.
        </Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.emptyIconContainer,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <MaterialIcons
            name="cloud-off"
            size={40}
            color={colors.secondaryText}
          />
        </View>
        <Text
          variant="h3"
          style={[styles.emptyMessageText, { color: colors.secondaryText }]}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const allFiles = [...(files.directories || []), ...(files.documents || [])];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FileGrid
        files={allFiles}
        viewMode={directoryLayout}
        onFileDoubleClick={handlePress}
        onMenuPress={onMenuPress}
        showHeader={allFiles.length > 0}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* {isSharing && (
        <View style={styles.loadingOverlay}>
          <View
            style={[
              styles.loadingBox,
              { backgroundColor: colors.secondaryBackground },
            ]}
          >
            <ActivityIndicator size="large" color={colors.tint} />
            <Text
              variant="caption"
              style={{ marginTop: 12, color: colors.text }}
            >
              Preparing file...
            </Text>
          </View>
        </View>
      )} */}

      <FilePreviewModal
        visible={isPreviewVisible}
        file={previewFile}
        onClose={closePreview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  loadingBox: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 150,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    marginTop: 12,
  },
  emptyIconContainer: {
    padding: 24,
    borderRadius: 9999,
    marginBottom: 16,
  },
  emptyMessageText: {
    color: "#6b7280",
  },
});
