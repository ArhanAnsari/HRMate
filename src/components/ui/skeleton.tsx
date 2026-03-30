import { BorderRadius, Colors } from "@/src/constants";
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import React from "react";
import { View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: ViewStyle["width"];
  height?: number;
  style?: ViewStyle;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  style,
  circle = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View
      style={[
        {
          backgroundColor: colors.backgroundSecondary,
          borderRadius: circle ? 9999 : BorderRadius.md,
          width,
          height,
        },
        style,
      ]}
    />
  );
};
