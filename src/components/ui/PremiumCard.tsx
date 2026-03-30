/**
 * 🎨 PREMIUM CARD COMPONENT - Foundational UI element
 * Glassmorphic effect, soft shadows, modern rounded corners
 */

import { THEME } from "@/src/theme";
import React from "react";
import {
    Pressable,
    StyleProp,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  borderless?: boolean;
  highlight?: boolean;
  actionable?: boolean;
  interactive?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  borderless = false,
  highlight = false,
  actionable = false,
  interactive = false,
  onPress,
  onLongPress,
  testID,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const containerBaseStyle: ViewStyle = {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
    ...(borderless
      ? {}
      : {
          borderWidth: 1,
          borderColor: isDark ? THEME.dark.border : THEME.light.border,
        }),
    ...THEME.shadows.md,
  };

  const highlightStyle: ViewStyle = {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  };

  const actionableStyle: ViewStyle = {
    ...THEME.shadows.sm,
  };

  const containerStyle: StyleProp<ViewStyle> = [
    containerBaseStyle,
    ...(highlight ? [highlightStyle] : []),
    ...(actionable ? [actionableStyle] : []),
    ...(style ? [style] : []),
  ];

  if (interactive || onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          containerStyle as any,
          pressed && {
            transform: [{ scale: 0.98 }],
          },
        ]}
        testID={testID}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={containerStyle} testID={testID}>
      {children}
    </View>
  );
};

export default PremiumCard;
