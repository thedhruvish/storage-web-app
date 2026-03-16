import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import { FileActionMenu } from "@/components/directory/FileActionMenu";
import { SearchBarHeader } from "@/components/SearchBarHeader";
import type { FileItem } from "@/components/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { useDirectoryStore } from "@/store/directory-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";

export default function StarredScreen() {
  const router = useRouter();
  const { directoryLayout, setDirectoryLayout } = useAppearance();
  const { selectedFiles, clearSelection } = useDirectoryStore();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);

  const { data, isLoading, isError, refetch } = useGetAllDirectoryList("", {
    isStarred: true,
    search: undefined,
    extensions: undefined,
    size: undefined,
  });

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
      if (file.extension) {
        console.log("preview file", file);
      } else {
        router.push(`/directory/${file._id}`);
      }
    },
    [router],
  );

  const selectionCount = selectedFiles.size;
  const isSelectionMode = selectionCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {isSelectionMode ? (
        <View
          style={[
            styles.selectionBar,
            { paddingTop: insets.top + 8, backgroundColor: colors.secondaryBackground },
          ]}
        >
          <View style={styles.selectionLeft}>
            <TouchableOpacity onPress={clearSelection} style={styles.selectionCloseBtn}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text variant="h3" style={{ color: colors.text, marginLeft: 12 }}>
              {selectionCount}
            </Text>
          </View>
          <View style={styles.selectionActions}>
            <TouchableOpacity style={styles.selectionActionBtn}>
              <MaterialIcons name="star-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionActionBtn}>
              <MaterialIcons name="file-download" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionActionBtn}>
              <MaterialIcons name="share" size={22} color={colors.text} />
            </TouchableOpacity>
            {selectionCount === 1 && (
              <TouchableOpacity style={styles.selectionActionBtn}>
                <MaterialIcons name="drive-file-rename-outline" size={22} color={colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.selectionActionBtn}>
              <MaterialIcons name="delete-outline" size={22} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ paddingTop: insets.top + 8 }}>
          <SearchBarHeader />
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>Starred</Text>
        <View style={[styles.toggleContainer, { backgroundColor: colors.secondaryBackground }]}>
          <TouchableOpacity
            onPress={() => setDirectoryLayout("list")}
            style={[styles.toggleItem, directoryLayout === "list" && { backgroundColor: colors.background, borderRadius: 8 }]}
          >
            <MaterialIcons name="view-list" size={20} color={directoryLayout === "list" ? colors.text : colors.secondaryText} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDirectoryLayout("grid")}
            style={[styles.toggleItem, directoryLayout === "grid" && { backgroundColor: colors.background, borderRadius: 8 }]}
          >
            <MaterialIcons name="grid-view" size={20} color={directoryLayout === "grid" ? colors.text : colors.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>

      <DirectoryContent
        files={files}
        isLoading={isLoading}
        isError={isError}
        onFileDoubleClick={handleFilePress}
        onMenuPress={(file) => setMenuFile(file)}
        emptyMessage="No starred files"
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <FileActionMenu
        visible={menuFile !== null}
        file={menuFile}
        onClose={() => setMenuFile(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  selectionLeft: { flexDirection: "row", alignItems: "center" },
  selectionCloseBtn: { padding: 8 },
  selectionActions: { flexDirection: "row", alignItems: "center" },
  selectionActionBtn: { padding: 8, marginLeft: 4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 14 },
  toggleContainer: { flexDirection: "row", padding: 4, borderRadius: 12 },
  toggleItem: { padding: 6 },
});
