/**
 * 🎯 PRIMARY BUTTON COMPONENT - Premium button with variants
 * Includes loading, disabled, and loading states with haptic feedback
 */

import { THEME } from "@/src/theme";
import * as Haptics from "expo-haptics";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    useColorScheme,
} from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  hapticFeedback?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  rightIcon,
  style,
  testID,
  hapticFeedback = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePress = () => {
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!disabled && !loading) {
      onPress();
    }
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: {
      height: THEME.componentSizes.button.sm.height,
      paddingHorizontal: THEME.spacing.md,
    },
    md: {
      height: THEME.componentSizes.button.md.height,
      paddingHorizontal: THEME.spacing.lg,
    },
    lg: {
      height: THEME.componentSizes.button.lg.height,
      paddingHorizontal: THEME.spacing.xl,
    },
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: THEME.colors.primary,
          borderColor: "transparent",
        };
      case "secondary":
        return {
          backgroundColor: "transparent",
          borderColor: isDark ? THEME.dark.border : THEME.light.border,
          borderWidth: 1,
        };
      case "tertiary":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
        };
      case "danger":
        return {
          backgroundColor: THEME.colors.danger,
          borderColor: "transparent",
        };
      default:
        return {
          backgroundColor: THEME.colors.primary,
          borderColor: "transparent",
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case "primary":
      case "danger":
        return "#FFFFFF";
      case "secondary":
      case "tertiary":
        return isDark ? THEME.dark.text.primary : THEME.light.text.primary;
      default:
        return "#FFFFFF";
    }
  };

  const textSize = {
    sm: { fontSize: 12, fontWeight: "600" as const },
    md: { fontSize: 14, fontWeight: "600" as const },
    lg: { fontSize: 16, fontWeight: "600" as const },
  };

  const styles = StyleSheet.create({
    button: {
      borderRadius: THEME.borderRadius.md,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: THEME.spacing.sm,
      ...getVariantStyles(),
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    text: {
      color: getTextColor(),
      ...textSize[size],
      fontWeight: "600",
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: THEME.spacing.sm,
    },
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && { opacity: 0.8 },
        style,
      ]}
      testID={testID}
    >
      <View style={styles.container}>
        {icon && !loading && icon}
        {loading ? (
          <ActivityIndicator
            size={size === "sm" ? "small" : "small"}
            color={getTextColor()}
          />
        ) : (
          <Text style={styles.text}>{label}</Text>
        )}
        {rightIcon && !loading && rightIcon}
      </View>
    </Pressable>
  );
};

export default PrimaryButton;
