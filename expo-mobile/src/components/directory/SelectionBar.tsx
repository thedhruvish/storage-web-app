import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { useDirectoryStore } from "@/store/directory-store";
import type { FileItem } from "./types";

interface SelectionBarProps {
  allFiles: FileItem[];
  onStar: (selectedFiles: FileItem[]) => void;
  onRename: (file: FileItem) => void;
  onShare: () => void;
  onDelete: (selectedFiles: FileItem[]) => void;
  onDownload: (selectedFiles: FileItem[]) => void;
}

export const SelectionBar = ({
  allFiles,
  onStar,
  onRename,
  onShare,
  onDelete,
  onDownload,
}: SelectionBarProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { selectedFiles, clearSelection } = useDirectoryStore();

  const selectionCount = selectedFiles.size;
  const isSelectionMode = selectionCount > 0;

  const selectedFileObjects = useMemo(() => {
    return allFiles.filter((f) => selectedFiles.has(f._id));
  }, [allFiles, selectedFiles]);

  if (!isSelectionMode) return null;

  const handleStarPress = () => {
    onStar(selectedFileObjects);
  };

  const handleRenamePress = () => {
    if (selectedFileObjects.length === 1) {
      onRename(selectedFileObjects[0]);
    }
  };

  const handleSharePress = () => {
    onShare();
  };

  const handleDeletePress = () => {
    onDelete(selectedFileObjects);
  };

  const handleDownloadPress = () => {
    onDownload(selectedFileObjects);
  };

  return (
    <View
      style={[
        styles.selectionBar,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.secondaryBackground,
        },
      ]}
    >
      <View style={styles.selectionLeft}>
        <TouchableOpacity
          onPress={clearSelection}
          style={styles.selectionCloseBtn}
        >
          <MaterialIcons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text variant="h3" style={{ color: colors.text, marginLeft: 12 }}>
          {selectionCount}
        </Text>
      </View>
      <View style={styles.selectionActions}>
        <TouchableOpacity
          style={styles.selectionActionBtn}
          onPress={handleStarPress}
        >
          <MaterialIcons name="star-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectionActionBtn}
          onPress={handleDownloadPress}
        >
          <MaterialIcons name="file-download" size={22} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.selectionActionBtn}
          onPress={handleSharePress}
        >
          <MaterialIcons name="share" size={22} color={colors.text} />
        </TouchableOpacity>
        {selectionCount === 1 && (
          <TouchableOpacity
            style={styles.selectionActionBtn}
            onPress={handleRenamePress}
          >
            <MaterialIcons
              name="drive-file-rename-outline"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.selectionActionBtn}
          onPress={handleDeletePress}
        >
          <MaterialIcons name="delete-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  selectionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionCloseBtn: {
    padding: 8,
  },
  selectionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionActionBtn: {
    padding: 8,
    marginLeft: 4,
  },
});
