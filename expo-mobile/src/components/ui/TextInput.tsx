import React, { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import Text from './Text';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

const TextInput = forwardRef<RNTextInput, TextInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  secureTextEntry,
  ...props
}, ref) => {
  const { colors, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const inputContainerStyles = [
    styles.inputContainer,
    {
      borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
      backgroundColor: colors.card,
    },
    props.editable === false && { opacity: 0.6, backgroundColor: colors.secondaryBackground },
  ];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={styles.label} color={error ? 'error' : 'text'}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            { color: colors.text, paddingVertical: spacing.sm },
            inputStyle,
          ]}
          placeholderTextColor={colors.secondaryText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text variant="caption" color="error" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
});

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0, // Remove default padding to align better with icons
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  error: {
    marginTop: 4,
    marginLeft: 4,
  },
});

export default TextInput;
