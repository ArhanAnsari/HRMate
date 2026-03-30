import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { BorderRadius, Colors, Shadows, Spacing } from "../../constants";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      onPress,
      title,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      fullWidth = false,
      style,
    },
    ref,
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? Colors.dark : Colors.light;

    const getButtonStyle = () => {
      const baseStyle: ViewStyle = {
        borderRadius: BorderRadius.md,
        justifyContent: "center",
        alignItems: "center",
        ...Shadows.md,
      };

      const sizeStyle: ViewStyle = {
        sm: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          minHeight: 36,
        },
        md: {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          minHeight: 44,
        },
        lg: {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          minHeight: 52,
        },
      }[size];

      const variantStyle: ViewStyle = {
        primary: { backgroundColor: colors.tint },
        secondary: {
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
        },
        outline: {
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: colors.tint,
        },
        ghost: { backgroundColor: "transparent" },
        danger: { backgroundColor: colors.danger },
      }[variant];

      if (fullWidth) {
        baseStyle.width = "100%";
      }

      if (disabled || isLoading) {
        baseStyle.opacity = 0.6;
      }

      return [baseStyle, sizeStyle, variantStyle, style];
    };

    const getTextStyle = () => {
      const size_text: Record<string, number> = {
        sm: 14,
        md: 16,
        lg: 18,
      };

      const variant_color: Record<string, string> = {
        primary: "#FFFFFF",
        secondary: colors.text,
        outline: colors.tint,
        ghost: colors.text,
        danger: "#FFFFFF",
      };

      return {
        fontSize: size_text[size],
        fontWeight: "600" as const,
        color: variant_color[variant],
      };
    };

    return (
      <TouchableOpacity
        ref={ref}
        style={getButtonStyle()}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === "primary" ? "#FFFFFF" : colors.tint}
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  },
);

Button.displayName = "Button";
