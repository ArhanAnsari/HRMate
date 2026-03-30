/**
 * 🎨 PREMIUM DASHBOARD - Control Center
 * Key metrics, activity feed, AI insights, and quick actions
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading
    setLoading(false);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? THEME.dark.background.main
        : THEME.light.background.main,
    },
    content: {
      padding: THEME.spacing.lg,
    },
    header: {
      marginBottom: THEME.spacing.xl,
    },
    greeting: {
      fontSize: THEME.typography.h2.fontSize,
      fontWeight: "700",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.sm,
    },
    subheader: {
      fontSize: THEME.typography.bodySm.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    },
    sectionTitle: {
      fontSize: THEME.typography.h5.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.md,
      marginTop: THEME.spacing.lg,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: THEME.spacing.md,
      marginBottom: THEME.spacing.lg,
    },
    metricCardWrapper: {
      width: "48%",
    },
    aiCard: {
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
      borderRadius: THEME.borderRadius.lg,
      padding: THEME.spacing.md,
      marginBottom: THEME.spacing.lg,
      borderColor: THEME.colors.primary,
      borderWidth: 1,
      opacity: 0.8,
    },
    aiTitle: {
      fontSize: THEME.typography.h6.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.sm,
      flexDirection: "row",
      gap: THEME.spacing.sm,
    },
    aiText: {
      fontSize: THEME.typography.bodySm.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      lineHeight: THEME.typography.bodySm.lineHeight,
      marginBottom: THEME.spacing.sm,
    },
    activityFeed: {
      marginBottom: THEME.spacing.xl,
    },
    activityItem: {
      flexDirection: "row",
      gap: THEME.spacing.md,
      paddingVertical: THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
      justifyContent: "center",
      alignItems: "center",
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: THEME.typography.body.fontSize,
      fontWeight: "500",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.xs,
    },
    activityTime: {
      fontSize: THEME.typography.caption.fontSize,
      color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary,
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const metrics = [
    {
      label: "Total Employees",
      value: "156",
      icon: (
        <MaterialCommunityIcons
          name="account-multiple"
          size={24}
          color={THEME.colors.primary}
        />
      ),
      trend: { direction: "up" as const, percentage: 12, label: "This month" },
    },
    {
      label: "Attendance Rate",
      value: "89%",
      icon: (
        <MaterialCommunityIcons
          name="calendar-check"
          size={24}
          color={THEME.colors.success}
        />
      ),
      trend: { direction: "up" as const, percentage: 5 },
    },
    {
      label: "Pending Approvals",
      value: "12",
      icon: (
        <MaterialCommunityIcons
          name="clipboard-check-outline"
          size={24}
          color={THEME.colors.warning}
        />
      ),
      trend: { direction: "down" as const, percentage: 8 },
    },
    {
      label: "Payroll Status",
      value: "On Track",
      icon: (
        <MaterialCommunityIcons
          name="cash-check"
          size={24}
          color={THEME.colors.success}
        />
      ),
    },
  ];

  const recentActivities = [
    {
      icon: "account-plus",
      title: "New Employee Added",
      description: "John Doe joined Engineering",
      time: "2 hours ago",
    },
    {
      icon: "calendar-check",
      title: "Leave Approved",
      description: "Sarah's leave request approved",
      time: "4 hours ago",
    },
    {
      icon: "file-document-check",
      title: "Payroll Processed",
      description: "March 2026 payroll completed",
      time: "1 day ago",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: THEME.spacing.xl,
        }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {getGreeting()}, {user?.name?.split(" ")[0] || "Manager"}! 👋
            </Text>
            <Text style={styles.subheader}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Quick Stats - Key Metrics */}
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          {loading ? (
            <SkeletonLoader type="card" count={2} />
          ) : (
            <View style={styles.metricsGrid}>
              {metrics.map((metric, index) => (
                <View key={index} style={styles.metricCardWrapper}>
                  <MetricCard
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    trend={metric.trend}
                    onPress={() => {
                      if (index === 0) router.push("/(dashboard)/employees");
                      else if (index === 1)
                        router.push("/(dashboard)/attendance");
                      else if (index === 2) router.push("/(dashboard)/leaves");
                      else router.push("/(dashboard)/payroll");
                    }}
                  />
                </View>
              ))}
            </View>
          )}

          {/* AI Insights Highlight */}
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Pressable
            onPress={() => router.push("/(dashboard)/insights")}
            style={({ pressed }) => [
              styles.aiCard,
              pressed && { opacity: 0.6 },
            ]}
          >
            <View style={{ flexDirection: "row", gap: THEME.spacing.sm }}>
              <Text style={{ fontSize: 20 }}>🤖</Text>
              <Text style={styles.sectionTitle}>Today's Recommendations</Text>
            </View>
            <Text style={styles.aiText}>
              • Engineering department attendance trending down
            </Text>
            <Text style={styles.aiText}>
              • 3 employees eligible for performance bonuses
            </Text>
            <Text style={styles.aiText}>
              • Recommend leave policy review for Q2
            </Text>
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: THEME.spacing.sm,
                marginTop: THEME.spacing.md,
              }}
            >
              <Text
                style={{
                  color: THEME.colors.primary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                View All Insights
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={THEME.colors.primary}
              />
            </Pressable>
          </Pressable>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityFeed}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons
                    name={activity.icon as any}
                    size={20}
                    color={THEME.colors.primary}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        onPress={() => router.push("/(dashboard)/employees/add")}
        options={[
          {
            icon: "account-plus",
            label: "Add Employee",
            onPress: () => router.push("/(dashboard)/employees/add"),
          },
          {
            icon: "upload",
            label: "Import",
            onPress: () => router.push("/(dashboard)/employees/bulk-import"),
          },
        ]}
        position="bottom-right"
      />
    </SafeAreaView>
  );
}
