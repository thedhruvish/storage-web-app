import React from "react";
import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import { getFileIconName } from "@/utils/file-icon-helper";
import { formatFileSize } from "@/utils/functions";
import type { FileItem } from "./types";
import { formatDistanceToNow } from "date-fns";

interface FileItemViewProps {
  file: FileItem;
  documentType: "folder" | "file";
  viewMode: "grid" | "list";
  isSelected: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onMenuPress?: () => void;
}

const getFileIcon = (
  documentType: string,
  file: FileItem,
  size: number,
  tintColor: string,
) => {
  if (documentType === "folder") {
    return <MaterialIcons name="folder" size={size} color={tintColor} />;
  }
  if (!file.extension) {
    return <MaterialIcons name="insert-drive-file" size={size} color="#666" />;
  }

  const iconType = getFileIconName(file.extension);
  switch (iconType) {
    case "document":
    case "word":
      return <MaterialIcons name="description" size={size} color="#2563eb" />;
    case "pdf":
      return (
        <MaterialIcons name="picture-as-pdf" size={size} color="#dc2626" />
      );
    case "image":
      return <MaterialIcons name="image" size={size} color="#16a34a" />;
    case "video":
      return <MaterialIcons name="videocam" size={size} color="#ea580c" />;
    case "audio":
      return <MaterialIcons name="audiotrack" size={size} color="#9333ea" />;
    case "archive":
      return <MaterialIcons name="archive" size={size} color="#ca8a04" />;
    case "spreadsheet":
      return <MaterialIcons name="grid-on" size={size} color="#65a30d" />;
    case "presentation":
      return <MaterialIcons name="slideshow" size={size} color="#d97706" />;
    case "code":
      return <MaterialIcons name="code" size={size} color="#4f46e5" />;
    default:
      return (
        <MaterialIcons name="insert-drive-file" size={size} color="#666" />
      );
  }
};

export const FileItemView = ({
  file,
  documentType,
  viewMode,
  isSelected,
  onPress,
  onLongPress,
  onMenuPress,
}: FileItemViewProps) => {
  const { colors } = useTheme();

  if (viewMode === "grid") {
    return (
      <TouchableOpacity
        style={[
          styles.gridContainer,
          {
            borderColor: colors.separator,
            backgroundColor: colors.background,
          },
          isSelected && {
            backgroundColor: colors.tint + "15",
            borderColor: colors.tint,
          },
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.gridIconWrapper}>
          {file.previewUrl ? (
            <Image
              source={{ uri: file.previewUrl }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            getFileIcon(documentType, file, 48, colors.tint)
          )}

          {file.isStarred && (
            <View style={styles.starBadgeGrid}>
              <MaterialIcons name="star" size={12} color="#eab308" />
            </View>
          )}
        </View>

        <View style={styles.gridTextWrapper}>
          <View style={styles.gridNameRow}>
            <Text
              variant="body"
              style={[styles.gridNameText, { color: colors.text }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {file.name}
            </Text>
            <TouchableOpacity
              onPress={onMenuPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.gridMenuButton}
            >
              <MaterialIcons
                name="more-vert"
                size={18}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // LIST VIEW
  return (
    <TouchableOpacity
      style={[
        styles.listContainer,
        { borderBottomColor: colors.separator },
        isSelected && {
          backgroundColor: colors.tint + "20",
        },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.listIconWrapper}>
        {getFileIcon(documentType, file, 24, colors.tint)}
        {file.isStarred && (
          <View
            style={[
              styles.starBadgeList,
              { backgroundColor: colors.background },
            ]}
          >
            <MaterialIcons name="star" size={10} color="#eab308" />
          </View>
        )}
      </View>

      <View style={styles.listMainContent}>
        <Text
          variant="body"
          style={{ color: colors.text }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {file.name}
        </Text>
        <Text
          variant="caption"
          style={[styles.listSubText, { color: colors.secondaryText }]}
        >
          {file.metaData?.size !== undefined
            ? formatFileSize(file.metaData.size)
            : documentType === "folder"
              ? "Folder"
              : "-"}
          {" • "}
          {file.createdAt
            ? formatDistanceToNow(new Date(file.createdAt), {
                addSuffix: true,
              })
            : ""}
        </Text>
      </View>

      {/* Three-dot menu for list view */}
      <TouchableOpacity
        style={styles.listMenuButton}
        onPress={onMenuPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons
          name="more-vert"
          size={20}
          color={colors.secondaryText}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Styles
  gridContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  gridMenuButton: {
    padding: 4,
  },
  gridIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  starBadgeGrid: {
    position: "absolute",
    top: -4,
    right: -4,
    borderRadius: 10,
    padding: 2,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  gridTextWrapper: {
    marginTop: 8,
    width: "100%",
  },
  gridNameRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  gridNameText: {
    flex: 1,
    textAlign: "center",
  },
  gridSubText: {
    marginTop: 2,
  },

  // List Styles
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listIconWrapper: {
    position: "relative",
    marginRight: 16,
  },
  starBadgeList: {
    position: "absolute",
    top: -2,
    right: -2,
    borderRadius: 8,
    padding: 1,
  },
  listMainContent: {
    flex: 1,
  },
  listSubText: {
    marginTop: 4,
  },
  listMenuButton: {
    padding: 8,
    marginLeft: 8,
  },
});
