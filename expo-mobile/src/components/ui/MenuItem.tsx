import React from "react";
import { TouchableOpacity, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import Text from "./Text";
import { Ionicons } from "@expo/vector-icons";

export interface MenuItemProps {
  label: string;
  subLabel?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  variant?: "default" | "danger";
  showChevron?: boolean;
  containerStyle?: ViewStyle;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  subLabel,
  leftIcon,
  rightElement,
  onPress,
  variant = "default",
  showChevron = true,
  containerStyle,
}) => {
  const { colors, spacing } = useTheme();

  const isDanger = variant === "danger";

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.leftContent}>
        {leftIcon && (
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isDanger
                  ? colors.error + "10"
                  : colors.primary + "10",
              },
            ]}
          >
            <Ionicons
              name={leftIcon}
              size={20}
              color={isDanger ? colors.error : colors.primary}
            />
          </View>
        )}
        <View style={styles.labelContainer}>
          <Text
            variant="body"
            weight="medium"
            color={isDanger ? "error" : "text"}
          >
            {label}
          </Text>
          {subLabel && (
            <Text variant="caption" color="secondaryText">
              {subLabel}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {rightElement}
        {showChevron && onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.secondaryText}
            style={{ marginLeft: spacing.xs }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  labelContainer: {
    flex: 1,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default MenuItem;
