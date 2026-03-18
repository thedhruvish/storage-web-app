import { Color } from "expo-router";
import { Platform } from "react-native";

export type SystemColorKey =
  | "background"
  | "secondaryBackground"
  | "text"
  | "secondaryText"
  | "separator"
  | "link"
  | "tint"
  | "primary"
  | "error"
  | "success"
  | "warning"
  | "border"
  | "card"
  | "notification";

export type SystemColors = Record<SystemColorKey, string>;

function getNativeDefault(isDark: boolean): SystemColors {
  const defaults = {
    light: {
      background: "#FFFFFF",
      secondaryBackground: "#F2F2F7",
      text: "#000000",
      secondaryText: "#666666",
      separator: "#E0E0E0",
      link: "#007AFF",
      tint: "#007AFF",
      primary: "#007AFF",
      error: "#FF3B30",
      success: "#34C759",
      warning: "#FF9500",
      border: "#C7C7CC",
      card: "#FFFFFF",
      notification: "#FF3B30",
    },
    dark: {
      background: "#000000",
      secondaryBackground: "#1C1C1E",
      text: "#FFFFFF",
      secondaryText: "#8E8E93",
      separator: "#38383A",
      link: "#0A84FF",
      tint: "#0A84FF",
      primary: "#0A84FF",
      error: "#FF453A",
      success: "#32D74B",
      warning: "#FF9F0A",
      border: "#38383A",
      card: "#1C1C1E",
      notification: "#FF375F",
    },
  };

  const selectedTheme = isDark ? defaults.dark : defaults.light;

  return Platform.select({
    ios: {
      background: Color.ios.systemBackground,
      secondaryBackground: Color.ios.secondarySystemBackground,
      text: Color.ios.label,
      secondaryText: Color.ios.secondaryLabel,
      separator: Color.ios.separator,
      link: Color.ios.link,
      tint: Color.ios.systemBlue,
      primary: Color.ios.systemBlue,
      error: Color.ios.systemRed,
      success: Color.ios.systemGreen,
      warning: Color.ios.systemOrange,
      border: Color.ios.quaternaryLabel,
      card: Color.ios.secondarySystemGroupedBackground,
      notification: Color.ios.systemPink,
    },

    android: {
      background: Color.android.dynamic.surface,
      secondaryBackground: Color.android.dynamic.surfaceContainer,
      text: Color.android.dynamic.onSurface,
      secondaryText: Color.android.dynamic.onSurfaceVariant,
      separator: Color.android.dynamic.outlineVariant,
      link: Color.android.dynamic.primary,
      tint: Color.android.dynamic.primary,
      primary: Color.android.dynamic.primary,
      error: Color.android.dynamic.error,
      success: Color.android.dynamic.tertiary,
      warning: Color.android.dynamic.errorContainer,
      border: Color.android.dynamic.outline,
      card: Color.android.dynamic.surfaceVariant,
      notification: Color.android.dynamic.primary,
    },

    default: selectedTheme,
  }) as SystemColors;
}

export const Colors = {
  light: getNativeDefault(false),
  dark: getNativeDefault(true),
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  gutter: 16,
  borderRadius: 12,
};
