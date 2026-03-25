import { useColorScheme } from "react-native";
import { Colors, Spacing } from "@/constants/Colors";

export function useTheme() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = colorScheme === "dark" ? "dark" : "light";
  return {
    colors: Colors[theme],
    spacing: Spacing,
    isDark: colorScheme === "dark",
    colorScheme,
  };
}
