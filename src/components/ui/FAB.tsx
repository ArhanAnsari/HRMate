/**
 * 🎨 FLOATING ACTION BUTTON (FAB) - Premium floating button
 * With expandable options and haptic feedback
 */

import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
    Animated,
    Pressable,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

interface FABOption {
  icon: string;
  label: string;
  onPress: () => void;
}

interface FABProps {
  icon?: string;
  onPress: () => void;
  options?: FABOption[];
  backgroundColor?: string;
  position?: "bottom-right" | "bottom-left" | "center";
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
  icon = "plus",
  onPress,
  options,
  backgroundColor,
  position = "bottom-right",
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [expanded, setExpanded] = useState(false);
  const expandAnimatedValue = new Animated.Value(0);

  const handlePress = () => {
    if (options && options.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setExpanded(!expanded);

      if (!expanded) {
        Animated.spring(expandAnimatedValue, {
          toValue: 1,
          useNativeDriver: false,
        }).start();
      } else {
        Animated.spring(expandAnimatedValue, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const bgColor = backgroundColor || THEME.colors.primary;

  const positionStyles: Record<string, ViewStyle> = {
    "bottom-right": { bottom: THEME.spacing.lg, right: THEME.spacing.lg },
    "bottom-left": { bottom: THEME.spacing.lg, left: THEME.spacing.lg },
    center: { bottom: THEME.spacing.lg, alignSelf: "center" as const },
  };

  const fabStyle: ViewStyle = {
    width: THEME.componentSizes.fab.size,
    height: THEME.componentSizes.fab.size,
    borderRadius: THEME.componentSizes.fab.size / 2,
    backgroundColor: bgColor,
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.lg,
    position: "absolute",
    ...positionStyles[position],
  };

  const optionsContainerStyle: ViewStyle = {
    position: "absolute",
    bottom: THEME.componentSizes.fab.size + THEME.spacing.md,
    right: THEME.spacing.sm,
    gap: THEME.spacing.md,
  };

  const optionButtonStyle: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark
      ? THEME.dark.background.alt
      : THEME.light.background.alt,
    justifyContent: "center",
    alignItems: "center",
    ...THEME.shadows.md,
  };

  const optionLabelStyle = {
    fontSize: THEME.typography.caption.fontSize,
    fontWeight: "500" as const,
    marginTop: THEME.spacing.sm,
    textAlign: "center" as const,
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
  };

  return (
    <>
      {expanded && options && options.length > 0 && (
        <Pressable
          onPress={handlePress}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />
      )}

      {expanded && options && options.length > 0 && (
        <View style={optionsContainerStyle}>
          {options.map((option, index) => (
            <Pressable
              key={index}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                option.onPress();
                setExpanded(false);
                expandAnimatedValue.setValue(0);
              }}
              style={({ pressed }) => [
                optionButtonStyle,
                pressed && { opacity: 0.8 },
              ]}
            >
              <MaterialCommunityIcons
                name={option.icon as any}
                size={24}
                color={THEME.colors.primary}
              />
            </Pressable>
          ))}
        </View>
      )}

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          fabStyle,
          style,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={THEME.componentSizes.fab.icon}
          color="#FFFFFF"
          style={expanded && { transform: [{ rotate: "45deg" }] }}
        />
      </Pressable>
    </>
  );
};

export default FAB;
