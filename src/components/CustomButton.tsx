import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../config/theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = true,
}) => {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      ...shadows.small,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        break;
      case 'large':
        baseStyle.paddingVertical = spacing.md + spacing.xs;
        baseStyle.paddingHorizontal = spacing.xl;
        break;
      default: // medium
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.lg;
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = colors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = colors.primary;
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.shadowOpacity = 0;
        baseStyle.elevation = 0;
        break;
      default: // primary
        baseStyle.backgroundColor = colors.primary;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: fontWeight.semibold,
    };

    // Size styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = fontSize.sm;
        break;
      case 'large':
        baseTextStyle.fontSize = fontSize.lg;
        break;
      default: // medium
        baseTextStyle.fontSize = fontSize.md;
    }

    // Variant styles
    switch (variant) {
      case 'outline':
      case 'ghost':
        baseTextStyle.color = colors.primary;
        break;
      default:
        baseTextStyle.color = colors.white;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
