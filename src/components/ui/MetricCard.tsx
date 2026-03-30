/**
 * 📊 METRIC CARD COMPONENT - Dashboard statistics display
 * Shows KPIs with trend indicators and color theming
 */

import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, useColorScheme, View, ViewStyle } from "react-native";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: "up" | "down" | "neutral";
    percentage: number;
    label?: string;
  };
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  backgroundColor,
  textColor,
  onPress,
  style,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const defaultBgColor = isDark
    ? THEME.dark.background.tertiary
    : THEME.light.background.tertiary;

  const defaultTextColor = isDark
    ? THEME.dark.text.primary
    : THEME.light.text.primary;

  const bgColor = backgroundColor || defaultBgColor;
  const textCol: string = textColor || defaultTextColor;

  const getTrendColor = (): string => {
    if (!trend) return THEME.colors.info;
    if (trend.direction === "up") return THEME.colors.success;
    if (trend.direction === "down") return THEME.colors.danger;
    return THEME.colors.info;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return "trending-up";
    if (trend.direction === "down") return "trending-down";
    return "minus";
  };

  const cardStyle: ViewStyle = {
    backgroundColor: bgColor,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    minHeight: 120,
  };

  const headerStyle: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: THEME.spacing.md,
  };

  const labelContainerStyle: ViewStyle = {
    flex: 1,
  };

  const labelStyle = {
    fontSize: THEME.typography.bodySm.fontSize,
    fontWeight: "500" as const,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    marginBottom: THEME.spacing.xs,
  };

  const valueContainerStyle: ViewStyle = {
    marginBottom: THEME.spacing.md,
  };

  const valueStyle = {
    fontSize: THEME.typography.h2.fontSize,
    fontWeight: "700" as const,
    color: textCol,
    lineHeight: THEME.typography.h2.lineHeight,
  };

  const footerStyle: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const trendContainerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.xs,
  };

  const trendTextStyle = {
    fontSize: THEME.typography.caption.fontSize,
    fontWeight: "600" as const,
    color: getTrendColor(),
  };

  const iconContainerStyle: ViewStyle = {
    width: THEME.componentSizes.icon.lg,
    height: THEME.componentSizes.icon.lg,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <Pressable onPress={onPress} style={style}>
      <View style={cardStyle}>
        <View style={headerStyle}>
          <View style={labelContainerStyle}>
            <Text style={labelStyle}>{label}</Text>
          </View>
          {icon && <View style={iconContainerStyle}>{icon}</View>}
        </View>

        <View style={valueContainerStyle}>
          <Text style={valueStyle}>{value}</Text>
        </View>

        {trend && (
          <View style={footerStyle}>
            <View style={trendContainerStyle}>
              <MaterialCommunityIcons
                name={getTrendIcon() as any}
                size={16}
                color={getTrendColor()}
              />
              <Text style={trendTextStyle}>
                {trend.direction === "up" ? "+" : ""}
                {trend.percentage}%
              </Text>
              {trend.label && (
                <Text
                  style={{
                    ...trendTextStyle,
                    color: isDark
                      ? THEME.dark.text.secondary
                      : THEME.light.text.secondary,
                  }}
                >
                  {trend.label}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default MetricCard;
