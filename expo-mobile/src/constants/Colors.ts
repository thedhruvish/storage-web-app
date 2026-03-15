import { Color } from "expo-router";
import { Platform } from "react-native";

export type SystemColorKey =
  | "background"
  | "secondaryBackground"
  | "text"
  | "secondaryText"
  | "separator"
  | "link"
  | "tint";

export type SystemColors = Record<SystemColorKey, string>;

function getNativeDefault(): SystemColors {
  return Platform.select({
    ios: {
      background: Color.ios.systemBackground,
      secondaryBackground: Color.ios.secondarySystemBackground,
      text: Color.ios.label,
      secondaryText: Color.ios.secondaryLabel,
      separator: Color.ios.separator,
      link: Color.ios.link,
      tint: Color.ios.systemBlue,
    },
    android: {
      background: Color.android.dynamic.surfaceContainer,
      secondaryBackground: Color.android.dynamic.surfaceContainer,
      text: Color.android.dynamic.onSurface,
      secondaryText: Color.android.dynamic.onSurfaceVariant,
      separator: Color.android.dynamic.outlineVariant,
      link: Color.android.dynamic.primary,
      tint: Color.android.dynamic.primary,
    },
    default: {
      background: "#FFFFFF",
      secondaryBackground: "#F2F2F7",
      text: "#000000",
      secondaryText: "#666666",
      separator: "#E0E0E0",
      link: "#007AFF",
      tint: "#007AFF",
    },
  }) as SystemColors;
}

export const Colors = {
  light: getNativeDefault(),
  dark: getNativeDefault(),
};
