import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import { FileActionMenu } from "@/components/directory/FileActionMenu";
import type { FileItem } from "@/components/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { useDirectoryStore } from "@/store/directory-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { SelectionBar } from "@/components/directory/SelectionBar";
import { RenameDialog } from "@/components/directory/RenameDialog";
import { useFileActions } from "@/hooks/use-file-actions";
import { UploadProgress } from "@/components/UploadProgress";
import { PlusMenuFAB } from "@/components/directory/PlusMenuFAB";
import { useNavigationDebounce } from "@/hooks/use-navigation-debounce";

export default function DirectoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { directoryLayout, setDirectoryLayout } = useAppearance();
  const { selectedFiles } = useDirectoryStore();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);
  const debounceNavigation = useNavigationDebounce();

  const { data, isLoading, isError, refetch } = useGetAllDirectoryList(
    id || "",
    {
      isStarred: undefined,
      search: undefined,
      extensions: undefined,
      size: undefined,
    },
  );

  const {
    handleStar,
    handleRename,
    handleDelete,
    handleShare,
    handleDownload,
    renameDialogOpen,
    fileToRename,
    openRenameDialog,
    closeRenameDialog,
  } = useFileActions(id);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const files = useMemo(() => {
    return {
      directories: data?.data?.directories || [],
      documents: data?.data?.documents || [],
      parent: data?.data?.path || null,
    };
  }, [data]);

  const allFiles = useMemo(
    () => [...files.directories, ...files.documents],
    [files],
  );

  const handleFilePress = useCallback(
    (file: FileItem) => {
      if (!file.extension) {
        debounceNavigation(() => {
          router.push(`/directory/${file._id}`);
        });
      }
    },
    [router, debounceNavigation],
  );

  const selectionCount = selectedFiles.size;
  const isSelectionMode = selectionCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {isSelectionMode ? (
        <SelectionBar
          allFiles={allFiles}
          onStar={handleStar}
          onRename={openRenameDialog}
          onShare={handleShare}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      ) : (
        /* ===== NORMAL HEADER ===== */
        <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            variant="h3"
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {files.parent ? files.parent.name : "Files"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            style={styles.searchIconBtn}
          >
            <MaterialIcons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text
          variant="h3"
          style={[styles.sectionTitle, { color: colors.text }]}
        >
          {files.parent ? files.parent.name : "Files"}
        </Text>
        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <TouchableOpacity
            onPress={() => setDirectoryLayout("list")}
            style={[
              styles.toggleItem,
              directoryLayout === "list" && {
                backgroundColor: colors.background,
                borderRadius: 8,
              },
            ]}
          >
            <MaterialIcons
              name="view-list"
              size={20}
              color={
                directoryLayout === "list" ? colors.text : colors.secondaryText
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDirectoryLayout("grid")}
            style={[
              styles.toggleItem,
              directoryLayout === "grid" && {
                backgroundColor: colors.background,
                borderRadius: 8,
              },
            ]}
          >
            <MaterialIcons
              name="grid-view"
              size={20}
              color={
                directoryLayout === "grid" ? colors.text : colors.secondaryText
              }
            />
          </TouchableOpacity>
        </View>
      </View>

      <DirectoryContent
        files={files}
        isLoading={isLoading}
        isError={isError}
        onFileDoubleClick={handleFilePress}
        onMenuPress={(file) => setMenuFile(file)}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <PlusMenuFAB directoryId={id} isSelectionMode={isSelectionMode} />

      {/* Three-dot Action Menu */}
      <FileActionMenu
        visible={menuFile !== null}
        file={menuFile}
        onClose={() => setMenuFile(null)}
        onStar={() => menuFile && handleStar([menuFile])}
        onRename={() => menuFile && openRenameDialog(menuFile)}
        onShare={handleShare}
        onDelete={() => menuFile && handleDelete([menuFile])}
        onDownload={() => menuFile && handleDownload([menuFile])}
      />

      {fileToRename && (
        <RenameDialog
          visible={renameDialogOpen}
          initialValue={fileToRename.name}
          onClose={closeRenameDialog}
          onConfirm={(newName) => handleRename(fileToRename, newName)}
          title={fileToRename.extension ? "Rename File" : "Rename Folder"}
        />
      )}

      <UploadProgress />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /* Normal Header */
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    marginLeft: 4,
  },
  searchIconBtn: {
    padding: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
  },
  toggleContainer: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
  },
  toggleItem: {
    padding: 6,
  },
});
