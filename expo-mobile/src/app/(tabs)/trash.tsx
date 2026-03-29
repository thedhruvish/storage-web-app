import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import {
  useGetAllTrash,
  useRestore,
  useHardDelete,
  useEmptyTrash,
  useBatchs,
} from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import { TrashActionMenu } from "@/components/directory/TrashActionMenu";
import type { FileItem } from "@/components/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { useDirectoryStore } from "@/store/directory-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";
import { useDialog } from "@/components/dialog";
import { useNavigationDebounce } from "@/hooks/use-navigation-debounce";

export default function TrashScreen() {
  const router = useRouter();
  const { directoryLayout, setDirectoryLayout } = useAppearance();
  const { selectedFiles, clearSelection } = useDirectoryStore();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);
  const { showDialog } = useDialog();
  const debounceNavigation = useNavigationDebounce();

  const { data, isLoading, isError, refetch } = useGetAllTrash();

  const restoreMutation = useRestore();
  const hardDeleteMutation = useHardDelete();
  const emptyTrashMutation = useEmptyTrash();
  const batchMutation = useBatchs();

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
    };
  }, [data]);

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

  const handleRestoreItem = (file: FileItem) => {
    restoreMutation.mutate(
      { id: file._id, type: file.extension ? "document" : "directory" },
      {
        onSuccess: () => {
          showDialog({
            title: "Success",
            message: "Item restored successfully",
            type: "success",
          });
          setMenuFile(null);
        },
        onError: (error: any) => {
          showDialog({
            title: "Error",
            message: error.message || "Failed to restore item",
            type: "error",
          });
        },
      },
    );
  };

  const handleHardDeleteItem = (file: FileItem) => {
    showDialog({
      title: "Delete Forever",
      message: `Are you sure you want to permanently delete "${file.name}"? This action cannot be undone.`,
      type: "warning",
      cancelText: "Cancel",
      confirmText: "Delete",
      onConfirm: () => {
        hardDeleteMutation.mutate(
          { id: file._id, type: file.extension ? "document" : "directory" },
          {
            onSuccess: () => {
              showDialog({
                title: "Success",
                message: "Item deleted forever",
                type: "success",
              });
              setMenuFile(null);
            },
            onError: (error: any) => {
              showDialog({
                title: "Error",
                message: error.message || "Failed to delete item",
                type: "error",
              });
            },
          },
        );
      },
    });
  };

  const handleEmptyTrash = () => {
    showDialog({
      title: "Empty Trash",
      message:
        "Are you sure you want to permanently delete all items in the trash? This action cannot be undone.",
      type: "warning",
      cancelText: "Cancel",
      confirmText: "Empty",
      onConfirm: () => {
        emptyTrashMutation.mutate(undefined, {
          onSuccess: () => {
            showDialog({
              title: "Success",
              message: "Trash emptied successfully",
              type: "success",
            });
          },
          onError: (error: any) => {
            showDialog({
              title: "Error",
              message: error.message || "Failed to empty trash",
              type: "error",
            });
          },
        });
      },
    });
  };

  const handleRestoreSelected = () => {
    const selectedItems = [...files.directories, ...files.documents].filter(
      (f) => selectedFiles.has(f._id),
    );

    const directories = selectedItems
      .filter((f) => !f.extension)
      .map((f) => f._id);
    const documents = selectedItems
      .filter((f) => f.extension)
      .map((f) => f._id);

    const performBatchRestore = async () => {
      try {
        if (directories.length > 0) {
          await batchMutation.mutateAsync({
            type: "directory",
            ids: directories,
            action: "restore",
          });
        }
        if (documents.length > 0) {
          await batchMutation.mutateAsync({
            type: "document",
            ids: documents,
            action: "restore",
          });
        }
        showDialog({
          title: "Success",
          message: "Items restored successfully",
          type: "success",
        });
        clearSelection();
      } catch (error: any) {
        showDialog({
          title: "Error",
          message: error.message || "Failed to restore items",
          type: "error",
        });
      }
    };

    performBatchRestore();
  };

  const handleDeleteForeverSelected = () => {
    showDialog({
      title: "Delete Forever",
      message: `Are you sure you want to permanently delete ${selectedFiles.size} items? This action cannot be undone.`,
      type: "warning",
      cancelText: "Cancel",
      confirmText: "Delete",
      onConfirm: async () => {
        const selectedItems = [...files.directories, ...files.documents].filter(
          (f) => selectedFiles.has(f._id),
        );

        const directories = selectedItems
          .filter((f) => !f.extension)
          .map((f) => f._id);
        const documents = selectedItems
          .filter((f) => f.extension)
          .map((f) => f._id);

        try {
          if (directories.length > 0) {
            await batchMutation.mutateAsync({
              type: "directory",
              ids: directories,
              action: "hdelete",
            });
          }
          if (documents.length > 0) {
            await batchMutation.mutateAsync({
              type: "document",
              ids: documents,
              action: "hdelete",
            });
          }
          showDialog({
            title: "Success",
            message: "Items deleted forever",
            type: "success",
          });
          clearSelection();
        } catch (error: any) {
          showDialog({
            title: "Error",
            message: error.message || "Failed to delete items",
            type: "error",
          });
        }
      },
    });
  };

  const selectionCount = selectedFiles.size;
  const isSelectionMode = selectionCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {isSelectionMode ? (
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
              onPress={handleRestoreSelected}
              style={styles.selectionActionBtn}
            >
              <MaterialIcons name="restore" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteForeverSelected}
              style={styles.selectionActionBtn}
            >
              <MaterialIcons
                name="delete-forever"
                size={22}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.headerWrapper, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerTitleRow}>
            <Text variant="h2" weight="bold" style={{ color: colors.text }}>
              Trash
            </Text>
            <TouchableOpacity onPress={handleEmptyTrash}>
              <MaterialIcons
                name="delete-sweep"
                size={24}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text variant="caption" style={{ color: colors.secondaryText }}>
          Items in trash are deleted after 30 days
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
        emptyMessage="Trash is empty"
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <TrashActionMenu
        visible={menuFile !== null}
        file={menuFile}
        onClose={() => setMenuFile(null)}
        onRestore={() => menuFile && handleRestoreItem(menuFile)}
        onHardDelete={() => menuFile && handleHardDeleteItem(menuFile)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  headerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
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
