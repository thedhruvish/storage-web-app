import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import type { FileItem } from "@/components/directory/types";
import { useAppearance } from "@/store/appearance-store";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "@/components/ui";

export default function DirectoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { directoryLayout, setDirectoryLayout } = useAppearance();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { data, isLoading, isError } = useGetAllDirectoryList(id || "", {
    isStarred: undefined,
    search: undefined,
    extensions: undefined,
    size: undefined,
  });

  const files = useMemo(() => {
    return {
      directories: data?.data?.directories || [],
      documents: data?.data?.documents || [],
      parent: data?.data?.parent || null,
    };
  }, [data]);

  const handleFileDoubleClick = useCallback(
    (file: FileItem) => {
      if (file.extension) {
        // Handle file preview later or use dialogs store
        console.log("preview file", file);
      } else {
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
      
      {/* Dynamic Header with Back Button and Search Pill */}
      <View style={[styles.headerContainer, { padadingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.searchPill, { backgroundColor: colors.secondaryBackground }]}
          onPress={() => router.push("/search")}
          activeOpacity={0.9}
        >
          <Text style={[styles.searchPlaceholder, { color: colors.secondaryText }]}>
            {files.parent ? `Search in ${files.parent.name}` : "Search"}
          </Text>
          <View style={[styles.avatarCircle, { backgroundColor: "#f97316" }]}>
            <Text style={styles.avatarText}>D</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text variant="h3" style={[styles.sectionTitle, { color: colors.text }]}>
          {files.parent ? files.parent.name : "Files"}
        </Text>
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
        onFileDoubleClick={handleFileDoubleClick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  searchPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
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
