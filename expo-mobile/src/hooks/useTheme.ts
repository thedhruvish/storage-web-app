import { useColorScheme } from 'react-native';
import { Colors, Spacing } from '@/constants/Colors';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return {
    colors: Colors[colorScheme],
    spacing: Spacing,
    isDark: colorScheme === 'dark',
    colorScheme,
  };
}
