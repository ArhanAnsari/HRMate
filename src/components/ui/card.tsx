import React from "react";
import { View, ViewStyle } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { BorderRadius, Colors, Shadows, Spacing } from "../../constants";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: "default" | "elevated" | "outlined";
  padding?: number;
}

export const Card = React.forwardRef<View, CardProps>(
  (
    { children, style, onPress, variant = "default", padding = Spacing.lg },
    ref,
  ) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const colors = isDark ? Colors.dark : Colors.light;

    const cardStyle: ViewStyle = {
      backgroundColor: colors.background,
      borderRadius: BorderRadius.lg,
      padding,
      ...Shadows.md,
    };

    if (variant === "elevated") {
      (cardStyle as any) = { ...cardStyle, ...Shadows.lg };
    } else if (variant === "outlined") {
      (cardStyle as any) = {
        ...cardStyle,
        borderWidth: 1,
        borderColor: colors.border,
        ...Shadows.none,
      };
    }

    const ViewComponent = onPress
      ? require("react-native").TouchableOpacity
      : View;

    return (
      <ViewComponent
        ref={ref}
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {children}
      </ViewComponent>
    );
  },
);

Card.displayName = "Card";
