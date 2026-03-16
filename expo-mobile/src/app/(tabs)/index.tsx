import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import type { FileItem } from "@/components/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";

export default function Index() {
  const router = useRouter();
  const { directoryLayout, setDirectoryLayout } = useAppearance();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Root directory is fetched with empty id
  const { data, isLoading, isError } = useGetAllDirectoryList("", {
    isStarred: undefined,
    search: undefined,
    extensions: undefined,
    size: undefined,
  });

  const files = useMemo(() => {
    return {
      directories: data?.data?.directories || [],
      documents: data?.data?.documents || [],
    };
  }, [data]);

  const handleFileDoubleClick = useCallback(
    (file: FileItem) => {
      if (file.extension) {
        // Preview file
        console.log("preview file", file);
      } else {
        // Navigate inside folder
        router.push(`/(tabs)/directory/${file._id}`);
      }
    },
    [router],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Top Search Pill */}
      <View
        style={[styles.headerSearchWrapper, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          style={[
            styles.searchPill,
            { backgroundColor: colors.secondaryBackground },
          ]}
          onPress={() => router.push("/search")}
          activeOpacity={0.9}
        >
          <Text
            style={[styles.searchPlaceholder, { color: colors.secondaryText }]}
          >
            Search in Drive
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text
          variant="h3"
          style={[styles.sectionTitle, { color: colors.text }]}
        >
          Files
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
        onFileDoubleClick={handleFileDoubleClick}
      />

      {/* FABs */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fabSecondary,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <MaterialIcons name="camera-alt" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fabPrimary, { backgroundColor: "#443a34" }]}
        >
          <MaterialIcons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSearchWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
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
});
