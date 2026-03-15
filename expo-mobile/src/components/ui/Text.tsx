import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { SystemColorKey } from '@/constants/Colors';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: SystemColorKey;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'text',
  weight,
  align,
  style,
  children,
  ...props
}) => {
  const { colors } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: 32, fontWeight: '700', lineHeight: 40 };
      case 'h2':
        return { fontSize: 24, fontWeight: '700', lineHeight: 32 };
      case 'h3':
        return { fontSize: 20, fontWeight: '600', lineHeight: 28 };
      case 'h4':
        return { fontSize: 18, fontWeight: '600', lineHeight: 24 };
      case 'body':
        return { fontSize: 16, fontWeight: '400', lineHeight: 24 };
      case 'bodySmall':
        return { fontSize: 14, fontWeight: '400', lineHeight: 20 };
      case 'caption':
        return { fontSize: 12, fontWeight: '400', lineHeight: 16 };
      case 'label':
        return { fontSize: 14, fontWeight: '500', lineHeight: 20 };
      default:
        return { fontSize: 16 };
    }
  };

  const combinedStyles = [
    getVariantStyle(),
    { color: colors[color] },
    weight && { fontWeight: weight },
    align && { textAlign: align },
    style,
  ];

  return (
    <RNText style={combinedStyles} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
