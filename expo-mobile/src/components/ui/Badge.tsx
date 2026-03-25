import React from "react";
import { View, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import Text from "./Text";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "outline";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "md",
  rounded = true,
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "default":
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.background },
        };
      case "secondary":
        return {
          container: { backgroundColor: colors.secondaryBackground },
          text: { color: colors.text },
        };
      case "success":
        return {
          container: { backgroundColor: colors.success },
          text: { color: colors.background },
        };
      case "error":
        return {
          container: { backgroundColor: colors.error },
          text: { color: colors.background },
        };
      case "warning":
        return {
          container: { backgroundColor: colors.warning },
          text: { color: colors.background },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: { color: colors.text },
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.background },
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { paddingVertical: 2, paddingHorizontal: 6 };
      case "md":
        return { paddingVertical: 4, paddingHorizontal: 8 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 8 };
    }
  };

  const { container: variantContainerStyle, text: variantTextStyle } =
    getVariantStyles();
  const sizeStyle = getSizeStyles();

  const badgeStyles = [
    styles.container,
    variantContainerStyle,
    sizeStyle,
    rounded && { borderRadius: 100 },
    style,
  ];

  return (
    <View style={badgeStyles}>
      <Text
        variant={size === "sm" ? "caption" : "bodySmall"}
        weight="medium"
        style={[variantTextStyle, textStyle]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Badge;
