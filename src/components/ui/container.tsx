import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Spacing } from "@/src/constants/spacing";
import React from "react";
import { ScrollView, View, ViewStyle } from "react-native";

interface ContainerProps {
  children: React.ReactNode;
  padding?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  style?: ViewStyle;
  scrollable?: boolean;
}

export const Container = React.forwardRef<View, ContainerProps>(
  (
    {
      children,
      padding = Spacing.lg,
      paddingVertical,
      paddingHorizontal,
      style,
      scrollable = false,
    },
    ref,
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? Colors.dark : Colors.light;

    const containerStyle: ViewStyle = {
      backgroundColor: colors.background,
      paddingVertical: paddingVertical ?? padding,
      paddingHorizontal: paddingHorizontal ?? padding,
      flex: 1,
    };

    const Component = scrollable ? ScrollView : View;

    return (
      <Component ref={ref} style={[containerStyle, style]}>
        {children}
      </Component>
    );
  },
);

Container.displayName = "Container";
