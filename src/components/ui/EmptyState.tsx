/**
 * 📭 EMPTY STATE COMPONENT - User-friendly empty screens
 * Shows illustration, message, and call-to-action
 */

import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    Text,
    TextStyle,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  image?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  image,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const containerStyle: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
  };

  const iconContainerStyle: ViewStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark
      ? THEME.dark.background.tertiary
      : THEME.light.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
  };

  const titleStyle: TextStyle = {
    fontSize: THEME.typography.h4.fontSize,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    textAlign: "center",
    marginBottom: THEME.spacing.md,
  };

  const descriptionStyle: TextStyle = {
    fontSize: THEME.typography.body.fontSize,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    textAlign: "center",
    marginBottom: THEME.spacing.lg,
    lineHeight: THEME.typography.body.lineHeight,
  };

  const actionButtonStyle: ViewStyle = {
    backgroundColor: THEME.colors.primary,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.md,
  };

  const actionTextStyle: TextStyle = {
    fontSize: THEME.typography.label.fontSize,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  };

  return (
    <View style={[containerStyle, style]}>
      <View style={iconContainerStyle}>
        <MaterialCommunityIcons
          name={icon as any}
          size={40}
          color={THEME.colors.primary}
        />
      </View>

      <Text style={titleStyle}>{title}</Text>
      <Text style={descriptionStyle}>{description}</Text>

      {action && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            actionButtonStyle,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={actionTextStyle}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
};

export default EmptyState;
