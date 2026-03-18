import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/use-theme";
import { TextInput, Text } from "@/components/ui";
import { useGetAllDirectoryList } from "@/api/directory-api";
import { DirectoryContent } from "@/components/directory/DirectoryContent";
import { FileActionMenu } from "@/components/directory/FileActionMenu";
import type { FileItem } from "@/components/directory/types";

const FILE_TYPE_OPTIONS = [
  { label: "Documents", value: "pdf,doc,docx,txt,rtf" },
  { label: "Images", value: "jpg,jpeg,png,gif,svg,webp" },
  { label: "Videos", value: "mp4,avi,mov,mkv,webm" },
  { label: "Audio", value: "mp3,wav,ogg,flac,aac" },
  { label: "Archives", value: "zip,rar,7z,tar,gz" },
  { label: "Spreadsheets", value: "xls,xlsx,csv" },
];

const SIZE_OPTIONS = [
  { label: "Any size", value: "any" },
  { label: "< 1 MB", value: "less_1048576" },
  { label: "< 10 MB", value: "less_10485760" },
  { label: "< 100 MB", value: "less_104857600" },
  { label: "> 100 MB", value: "greater_104857600" },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [menuFile, setMenuFile] = useState<FileItem | null>(null);

  const { data, isLoading, isError } = useGetAllDirectoryList("", {
    isStarred: isStarred || undefined,
    search: searchQuery || undefined,
    extensions: selectedType || undefined,
    size: selectedSize || undefined,
  });

  const files = React.useMemo(() => {
    return {
      directories: data?.data?.directories || [],
      documents: data?.data?.documents || [],
    };
  }, [data]);

  const handleFilePress = (file: FileItem) => {
    if (file.extension) {
    } else {
      router.push(`/directory/${file._id}`);
    }
  };

  const hasActiveFilters = isStarred || !!selectedType || !!selectedSize;
  const hasQuery = searchQuery.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <TextInput
            autoFocus
            placeholder="Search in StoreOne"
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInputContainer}
            inputStyle={styles.searchInput}
          />
        </View>

        {(hasQuery || hasActiveFilters) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setIsStarred(false);
              setSelectedType(undefined);
              setSelectedSize(undefined);
            }}
            style={styles.iconButton}
          >
            <MaterialIcons
              name="close"
              size={24}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <TouchableOpacity
            style={[
              styles.chip,
              { borderColor: colors.separator },
              isStarred && {
                backgroundColor: colors.tint + "20",
                borderColor: colors.tint,
              },
            ]}
            onPress={() => setIsStarred(!isStarred)}
          >
            <MaterialIcons
              name={isStarred ? "star" : "star-outline"}
              size={16}
              color={isStarred ? colors.tint : colors.secondaryText}
              style={{ marginRight: 4 }}
            />
            <Text
              variant="caption"
              style={{
                color: isStarred ? colors.tint : colors.secondaryText,
                fontWeight: "600",
              }}
            >
              Starred
            </Text>
          </TouchableOpacity>

          {FILE_TYPE_OPTIONS.map((opt) => {
            const active = selectedType === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  { borderColor: colors.separator },
                  active && {
                    backgroundColor: colors.tint + "20",
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedType(active ? undefined : opt.value)}
              >
                <Text
                  variant="caption"
                  style={{
                    color: active ? colors.tint : colors.secondaryText,
                    fontWeight: "600",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {SIZE_OPTIONS.map((opt) => {
            const active = selectedSize === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.chip,
                  { borderColor: colors.separator },
                  active && {
                    backgroundColor: colors.tint + "20",
                    borderColor: colors.tint,
                  },
                ]}
                onPress={() => setSelectedSize(active ? undefined : opt.value)}
              >
                <Text
                  variant="caption"
                  style={{
                    color: active ? colors.tint : colors.secondaryText,
                    fontWeight: "600",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      {!hasQuery && !hasActiveFilters ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="search"
            size={64}
            color={colors.secondaryText}
            style={{ opacity: 0.2 }}
          />
          <Text
            variant="body"
            style={{ color: colors.secondaryText, marginTop: 16 }}
          >
            Search for files, folders and more
          </Text>
        </View>
      ) : (
        <DirectoryContent
          files={files}
          isLoading={isLoading}
          isError={isError}
          onFileDoubleClick={handleFilePress}
          onMenuPress={(file) => setMenuFile(file)}
          emptyMessage="No results found"
        />
      )}

      <FileActionMenu
        visible={menuFile !== null}
        file={menuFile}
        onClose={() => setMenuFile(null)}
      />
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
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  iconButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  searchInputContainer: {
    backgroundColor: "transparent",
    borderWidth: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 4,
  },
  chipContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
});
