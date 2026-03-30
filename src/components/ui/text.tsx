import { Colors, Typography } from "@/src/constants";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodySmall"
  | "bodyXSmall"
  | "caption"
  | "label"
  | "labelSmall";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "success"
    | "danger"
    | "warning"
    | "info";
  weight?: "400" | "500" | "600" | "700";
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ variant = "body", color = "primary", weight, style, ...props }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? Colors.dark : Colors.light;

    const typography = Typography[variant];

    const colorMap: Record<string, string> = {
      primary: colors.text,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
      success: colors.success,
      danger: colors.danger,
      warning: colors.warning,
      info: colors.info,
    };

    const textStyle = {
      fontSize: typography.fontSize,
      lineHeight: typography.lineHeight,
      fontWeight: (weight || typography.fontWeight) as any,
      color: colorMap[color],
    };

    return <RNText ref={ref} style={[textStyle, style]} {...props} />;
  },
);

Text.displayName = "Text";
