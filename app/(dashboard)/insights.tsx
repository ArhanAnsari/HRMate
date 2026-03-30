/**
 * 💡 INSIGHTS SCREEN - Premium Dashboard
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { THEME } from "@/src/theme";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={titleStyle}>Insights</Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark
              ? THEME.dark.text.secondary
              : THEME.light.text.secondary,
            marginBottom: THEME.spacing.lg,
          }}
        >
          AI-powered HR analytics
        </Text>

        <View style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}>
          <MetricCard
            label="Avg Attendance"
            value="92%"
            trend={{ direction: "up", percentage: 5 }}
          />
          <MetricCard
            label="Active Employees"
            value="28"
            trend={{ direction: "up", percentage: 2 }}
          />
          <MetricCard
            label="Pending Requests"
            value="5"
            trend={{ direction: "down", percentage: 3 }}
          />
          <MetricCard
            label="On Leave Today"
            value="2"
            trend={{ direction: "neutral", percentage: 0 }}
          />
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
            marginBottom: THEME.spacing.md,
          }}
        >
          Department Insights
        </Text>

        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: THEME.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              Operations
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: THEME.colors.primary,
              }}
            >
              92%
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: isDark ? THEME.dark.border : THEME.light.border,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "92%",
                height: "100%",
                backgroundColor: THEME.colors.primary,
              }}
            />
          </View>
        </PremiumCard>

        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: THEME.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              Engineering
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: THEME.colors.success,
              }}
            >
              95%
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: isDark ? THEME.dark.border : THEME.light.border,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "95%",
                height: "100%",
                backgroundColor: THEME.colors.success,
              }}
            />
          </View>
        </PremiumCard>

        <PremiumCard>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: THEME.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              HR
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: THEME.colors.warning,
              }}
            >
              88%
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: isDark ? THEME.dark.border : THEME.light.border,
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: "88%",
                height: "100%",
                backgroundColor: THEME.colors.warning,
              }}
            />
          </View>
        </PremiumCard>
      </ScrollView>
    </SafeAreaView>
  );
}
