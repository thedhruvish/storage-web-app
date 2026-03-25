import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { useTheme } from "@/hooks/use-theme";
import type { FileItem } from "./types";

interface TrashActionMenuProps {
  visible: boolean;
  file: FileItem | null;
  onClose: () => void;
  onRestore?: () => void;
  onHardDelete?: () => void;
}

interface ActionItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
}

export const TrashActionMenu = ({
  visible,
  file,
  onClose,
  onRestore,
  onHardDelete,
}: TrashActionMenuProps) => {
  const { colors } = useTheme();

  if (!file) return null;

  const actions: ActionItem[] = [
    {
      icon: "restore",
      label: "Restore",
      onPress: onRestore,
    },
    {
      icon: "delete-forever",
      label: "Permanent Delete",
      onPress: onHardDelete,
      color: colors.error,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          {/* File info header */}
          <View style={styles.sheetHeader}>
            <Text
              variant="body"
              style={{ color: colors.text, fontWeight: "600" }}
              numberOfLines={1}
            >
              {file.name}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.separator }]}
          />

          {/* Action list */}
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionRow}
              onPress={() => {
                action.onPress?.();
                onClose();
              }}
            >
              <MaterialIcons
                name={action.icon}
                size={24}
                color={action.color || colors.text}
                style={styles.actionIcon}
              />
              <Text
                variant="body"
                style={{ color: action.color || colors.text }}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  actionIcon: {
    marginRight: 16,
  },
});
