import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Text } from "@/components/ui";
import { FileItemView } from "./FileItemView";
import { useDirectoryStore } from "@/store/directory-store";
import type { FileGridProps, FileItem } from "./types";

export const FileGrid = ({
  files,
  documentType,
  viewMode,
  onFileDoubleClick,
  showHeader = false,
}: FileGridProps) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { selectedFiles, toggleSelection } = useDirectoryStore();

  const numColumns = useMemo(() => {
    if (viewMode === "list") return 1;
    // Calculate columns based on width. Assuming a min width of 120 per item.
    return Math.max(2, Math.floor(width / 150));
  }, [viewMode, width]);

  const handlePress = (fileId: string) => {
    toggleSelection(fileId, false, false);
  };

  const handleLongPress = (file: FileItem) => {
    // Open context menu equivalent or actions later.
    // For now, toggle selection as meta key equivalent.
    toggleSelection(file._id, true, false);
  };

  const renderItem = ({ item }: { item: FileItem }) => {
    const isSelected = selectedFiles.has(item._id);

    return (
      <FileItemView
        file={item}
        documentType={item.type || documentType || "file"}
        viewMode={viewMode}
        isSelected={isSelected}
        onPress={() => handlePress(item._id)}
        onLongPress={() => handleLongPress(item)}
      />
    );
  };

  const ListHeader = () => {
    if (!showHeader || viewMode === "grid") return null;

    return (
      <View style={styles.listHeader}>
        <Text variant="caption" style={styles.headerTitle}>
          Name
        </Text>
        <Text variant="caption" style={styles.headerSize}>
          Size / Mod
        </Text>
      </View>
    );
  };

  if (!files || files.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlashList
        key={`${viewMode}-${numColumns}`}
        data={files}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={numColumns}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          viewMode === "grid" ? styles.gridContent : styles.listContent,
          {
            paddingBottom: insets.bottom + 24,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  listHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    justifyContent: "space-between",
  },
  headerTitle: {
    flex: 1,
    color: "#666",
  },
  headerSize: {
    color: "#666",
  },
});
