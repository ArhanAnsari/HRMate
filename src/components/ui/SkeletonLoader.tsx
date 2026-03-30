/**
 * ⚡ SKELETON LOADER COMPONENT - Premium loading placeholders
 * Animated shimmer effect for data loading states
 */

import { THEME } from "@/src/theme";
import React, { useEffect } from "react";
import { Animated, useColorScheme, View, ViewStyle } from "react-native";

interface SkeletonLoaderProps {
  type?: "card" | "text" | "list" | "avatar" | "chart";
  count?: number;
  height?: number;
  width?: number | string;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "card",
  count = 1,
  height,
  width = "100%",
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const shimmerAnimatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimatedValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnimatedValue, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [shimmerAnimatedValue]);

  const shimmerOpacity = shimmerAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getSkeletonHeight = () => {
    if (height) return height;
    switch (type) {
      case "card":
        return 120;
      case "text":
        return 12;
      case "avatar":
        return 56;
      case "chart":
        return 200;
      case "list":
      default:
        return 60;
    }
  };

  const renderSkeleton = () => {
    const skeletonHeight = getSkeletonHeight();

    switch (type) {
      case "card": {
        return (
          <Animated.View
            style={{
              backgroundColor: isDark
                ? THEME.colors.dark.backgroundTertiary
                : THEME.colors.background.tertiary,
              height: skeletonHeight,
              borderRadius: THEME.borderRadius.lg,
              marginBottom: THEME.spacing.md,
              opacity: shimmerOpacity,
            }}
          />
        );
      }

      case "text": {
        return (
          <>
            <Animated.View
              style={{
                backgroundColor: isDark
                  ? THEME.colors.dark.backgroundTertiary
                  : THEME.colors.background.tertiary,
                height: 12,
                borderRadius: 4,
                marginBottom: THEME.spacing.sm,
                width: "90%",
                opacity: shimmerOpacity,
              }}
            />
            <Animated.View
              style={{
                backgroundColor: isDark
                  ? THEME.colors.dark.backgroundTertiary
                  : THEME.colors.background.tertiary,
                height: 12,
                borderRadius: 4,
                marginBottom: THEME.spacing.md,
                width: "75%",
                opacity: shimmerOpacity,
              }}
            />
          </>
        );
      }

      case "avatar": {
        return (
          <Animated.View
            style={{
              backgroundColor: isDark
                ? THEME.colors.dark.backgroundTertiary
                : THEME.colors.background.tertiary,
              width: skeletonHeight,
              height: skeletonHeight,
              borderRadius: skeletonHeight / 2,
              marginBottom: THEME.spacing.md,
              opacity: shimmerOpacity,
            }}
          />
        );
      }

      case "list": {
        return (
          <View
            style={{
              flexDirection: "row",
              gap: THEME.spacing.md,
              marginBottom: THEME.spacing.md,
            }}
          >
            <Animated.View
              style={{
                backgroundColor: isDark
                  ? THEME.colors.dark.backgroundTertiary
                  : THEME.colors.background.tertiary,
                width: 56,
                height: 56,
                borderRadius: 8,
                opacity: shimmerOpacity,
              }}
            />
            <View style={{ flex: 1, gap: THEME.spacing.sm }}>
              <Animated.View
                style={{
                  backgroundColor: isDark
                    ? THEME.colors.dark.backgroundTertiary
                    : THEME.colors.background.tertiary,
                  height: 12,
                  borderRadius: 4,
                  width: "80%",
                  opacity: shimmerOpacity,
                }}
              />
              <Animated.View
                style={{
                  backgroundColor: isDark
                    ? THEME.colors.dark.backgroundTertiary
                    : THEME.colors.background.tertiary,
                  height: 12,
                  borderRadius: 4,
                  width: "60%",
                  opacity: shimmerOpacity,
                }}
              />
            </View>
          </View>
        );
      }

      case "chart": {
        return (
          <View style={{ gap: THEME.spacing.md }}>
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                style={{
                  backgroundColor: isDark
                    ? THEME.colors.dark.backgroundTertiary
                    : THEME.colors.background.tertiary,
                  height: 50,
                  borderRadius: 8,
                  marginBottom: THEME.spacing.md,
                  opacity: shimmerOpacity,
                }}
              />
            ))}
          </View>
        );
      }

      default:
        return null;
    }
  };

  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(
      <View key={i} style={style}>
        {renderSkeleton()}
      </View>,
    );
  }

  return <>{items}</>;
};

export default SkeletonLoader;
