import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui";
import { FileGrid } from "./FileGrid";
import { useAppearance } from "@/store/appearance-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";
import type { FileItem } from "./types";

interface DirectoryContentProps {
  files: { directories?: FileItem[]; documents?: FileItem[] };
  isLoading: boolean;
  isError: boolean;
  onFileDoubleClick: (file: FileItem) => void;
  onMenuPress?: (file: FileItem) => void;
  emptyMessage?: string;
}

export const DirectoryContent = ({
  files,
  isLoading,
  isError,
  onFileDoubleClick,
  onMenuPress,
  emptyMessage = "This folder is empty",
}: DirectoryContentProps) => {
  const { directoryLayout } = useAppearance();
  const { colors } = useTheme();

  const isEmpty = !files?.directories?.length && !files?.documents?.length;

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text variant="caption" style={[styles.loadingText, { color: colors.secondaryText }]}>Loading...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="cloud-off" size={48} color={colors.error} />
        <Text variant="body" style={[styles.errorText, { color: colors.error }]}>Error loading content.</Text>
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.secondaryBackground }]}>
          <MaterialIcons name="cloud-off" size={40} color={colors.secondaryText} />
        </View>
        <Text variant="h3" style={[styles.emptyMessageText, { color: colors.secondaryText }]}>{emptyMessage}</Text>
      </View>
    );
  }

  const allFiles = [
    ...(files.directories || []),
    ...(files.documents || []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FileGrid
        files={allFiles}
        viewMode={directoryLayout}
        onFileDoubleClick={onFileDoubleClick}
        onMenuPress={onMenuPress}
        showHeader={allFiles.length > 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
