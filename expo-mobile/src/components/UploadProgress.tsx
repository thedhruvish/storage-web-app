import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  Layout,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/use-theme";
import { Text } from "./ui";
import { useUploadStore, cancelUpload, retryUpload } from "@/store/upload-store";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const UploadProgress = () => {
  const { colors, spacing } = useTheme();
  const { files, isSheetVisible, setSheetVisible } = useUploadStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFiles = useMemo(
    () => files.filter((f) => f.status !== "success" && f.status !== "canceled"),
    [files]
  );
  
  const completedCount = useMemo(
    () => files.filter((f) => f.status === "success").length,
    [files]
  );

  const isUploading = useMemo(
    () => files.some((f) => f.status === "uploading" || f.status === "queued"),
    [files]
  );

  const errorFiles = useMemo(
    () => files.filter((f) => f.status === "error" || f.status === "fail"),
    [files]
  );

  const hasErrors = errorFiles.length > 0;

  if (!isSheetVisible || files.length === 0) return null;

  const handleClose = () => {
    setSheetVisible(false);
    setIsExpanded(false);
  };

  const statusText = isUploading
    ? `Uploading ${activeFiles.length} ${activeFiles.length === 1 ? "file" : "files"}...`
    : hasErrors
      ? `${errorFiles.length} upload${errorFiles.length === 1 ? "" : "s"} failed`
      : completedCount > 0 
        ? `${completedCount} upload${completedCount === 1 ? "" : "s"} complete`
        : "Upload finished";

  const getHeaderIcon = () => {
    if (isUploading) return { name: "cloud-upload", color: colors.primary, bg: colors.primary + "20" };
    if (hasErrors) return { name: "error", color: "#F44336", bg: "#F4433620" };
    return { name: "check", color: "#4CAF50", bg: "#4CAF5020" };
  };

  const headerIcon = getHeaderIcon();

  return (
    <Animated.View
      entering={SlideInDown}
      exiting={SlideOutDown}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          maxHeight: isExpanded ? SCREEN_HEIGHT * 0.7 : 64,
        },
        isExpanded && styles.expandedContainer,
      ]}
    >
      {/* Collapsed Bar / Header */}
      <View style={[styles.header, { height: 64, paddingHorizontal: spacing.md }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: headerIcon.bg }]}>
            <MaterialIcons
              name={headerIcon.name as any}
              size={20}
              color={headerIcon.color}
            />
          </View>
          <Text variant="body" weight="medium" style={{ marginLeft: spacing.sm, color: hasErrors && !isUploading ? "#F44336" : colors.text }}>
            {statusText}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.actionButton}>
            <MaterialIcons
              name={isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-up"}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.actionButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded List */}
      {isExpanded && (
        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 24 }}>
          {files.map((file) => (
            <Animated.View
              key={file.id}
              layout={Layout}
              entering={FadeIn}
              style={[styles.fileItem, { borderBottomColor: colors.border, borderBottomWidth: 0.5 }]}
            >
              <View style={styles.fileIcon}>
                <MaterialIcons
                  name={file.mimeType.startsWith("image/") ? "image" : "insert-drive-file"}
                  size={24}
                  color={colors.secondaryText}
                />
              </View>
              <View style={styles.fileInfo}>
                <Text variant="body" numberOfLines={1} weight="medium">
                  {file.name}
                </Text>
                <View style={styles.progressContainer}>
                  {file.status === "uploading" && (
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { backgroundColor: colors.primary, width: `${file.progress}%` },
                        ]}
                      />
                    </View>
                  )}
                  <Text variant="small" color="secondaryText">
                    {file.status === "uploading"
                      ? `${file.progress}%`
                      : file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </Text>
                </View>
                {file.error && (
                  <Text variant="small" style={{ color: "#F44336" }}>
                    {file.error}
                  </Text>
                )}
              </View>
              <View style={styles.fileActions}>
                {file.status === "uploading" && (
                  <TouchableOpacity onPress={() => cancelUpload(file.id)}>
                    <MaterialIcons name="close" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                )}
                {(file.status === "error" || file.status === "canceled" || file.status === "fail") && (
                  <TouchableOpacity onPress={() => retryUpload(file.id)}>
                    <MaterialIcons name="refresh" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {file.status === "success" && (
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                )}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  expandedContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  fileIcon: {
    marginRight: 16,
  },
  fileInfo: {
    flex: 1,
  },
  progressContainer: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginRight: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  fileActions: {
    marginLeft: 16,
  },
});
