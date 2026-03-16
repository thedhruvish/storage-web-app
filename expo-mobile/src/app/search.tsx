import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { TextInput, Text } from "@/components/ui";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import type { FileItem } from "@/components/directory/types";

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useGetAllDirectoryList("", {
    isStarred: undefined,
    search: searchQuery || undefined,
    extensions: undefined,
    size: undefined,
  }, {
    enabled: searchQuery.length > 0
  });

  const files = React.useMemo(() => {
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
        router.push(`/(tabs)/directory/${file._id}`);
      }
    },
    [router]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchWrapper}>
          <TextInput
            autoFocus
            placeholder="Search in Drive"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>

        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <MaterialIcons name="close" size={24} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="search" size={64} color={colors.secondaryText} style={{ opacity: 0.2 }} />
          <Text variant="body" style={{ color: colors.secondaryText, marginTop: 16 }}>
            Search for files, folders and more
          </Text>
        </View>
      ) : (
        <DirectoryContent
          files={files}
          isLoading={isLoading}
          isError={isError}
          onFileDoubleClick={handleFileDoubleClick}
          emptyMessage="No results found"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
  },
  searchWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  searchInputContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  searchInput: {
    fontSize: 18,
  },
  clearButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
});
