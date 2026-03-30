import { BorderRadius, Colors, Spacing } from "@/src/constants";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import React from "react";
import { Text, View, ViewStyle } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  size = "md",
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const variantColor = {
    success: { bg: colors.successLight, text: colors.success },
    warning: { bg: colors.warningLight, text: colors.warning },
    danger: { bg: colors.dangerLight, text: colors.danger },
    info: { bg: colors.infoLight, text: colors.info },
    default: { bg: colors.backgroundSecondary, text: colors.textSecondary },
  }[variant];

  const sizeStyle = {
    sm: { paddingVertical: 2, paddingHorizontal: Spacing.sm, fontSize: 11 },
    md: { paddingVertical: 4, paddingHorizontal: Spacing.md, fontSize: 12 },
    lg: { paddingVertical: 6, paddingHorizontal: Spacing.lg, fontSize: 14 },
  }[size];

  return (
    <View
      style={[
        {
          backgroundColor: variantColor.bg,
          borderRadius: BorderRadius.full,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text
        style={{
          color: variantColor.text,
          fontSize: sizeStyle.fontSize,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
};
