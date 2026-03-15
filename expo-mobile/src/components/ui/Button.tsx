import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import Text from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title?: string;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  title,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  children,
  ...props
}) => {
  const { colors, spacing } = useTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; color: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.background },
          color: colors.background,
        };
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondaryBackground },
          text: { color: colors.text },
          color: colors.text,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.border,
          },
          text: { color: colors.text },
          color: colors.text,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.text },
          color: colors.text,
        };
      case 'danger':
        return {
          container: { backgroundColor: colors.error },
          text: { color: colors.background },
          color: colors.background,
        };
      case 'success':
        return {
          container: { backgroundColor: colors.success },
          text: { color: colors.background },
          color: colors.background,
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: colors.background },
          color: colors.background,
        };
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: 8 };
      case 'md':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 10 };
      case 'lg':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, borderRadius: 12 };
      default:
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 10 };
    }
  };

  const { container: variantContainerStyle, text: variantTextStyle, color: loadingColor } = getVariantStyles();
  const sizeStyle = getSizeStyles();

  const buttonStyles = [
    styles.base,
    variantContainerStyle,
    sizeStyle,
    disabled && { opacity: 0.5 },
    style,
  ];

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          {title ? (
            <Text
              style={[variantTextStyle, textStyle]}
              weight="semibold"
              align="center"
            >
              {title}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.7}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
