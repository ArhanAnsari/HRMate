/**
 * 🎨 PREMIUM DASHBOARD - Control Center
 * Key metrics, activity feed, AI insights, and quick actions
 * All data sourced from real Appwrite backend
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { employeeQueries } from "@/src/services/appwriteClient";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveCount: number;
  pendingLeaves: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveCount: 0,
    pendingLeaves: 0,
  });

  const loadDashboardData = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    try {
      const [empStats, leaveStats] = await Promise.all([
        employeeQueries.getEmployeeStats(user.companyId),
        leavesService.getLeaveStats(user.companyId).catch(() => ({
          pending: 0,
          approved: 0,
          rejected: 0,
        })),
      ]);

      setMetrics({
        totalEmployees: empStats.total,
        activeEmployees: empStats.active,
        onLeaveCount: empStats.onLeave,
        pendingLeaves: leaveStats.pending,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
    aiText: {
      fontSize: THEME.typography.bodySm.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      lineHeight: THEME.typography.bodySm.lineHeight,
      marginBottom: THEME.spacing.sm,
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const metricCards = [
    {
      label: "Total Employees",
      value: loading ? "..." : String(metrics.totalEmployees),
      icon: (
        <MaterialCommunityIcons
          name="account-multiple"
          size={24}
          color={THEME.colors.primary}
        />
      ),
      onPress: () => router.push("/(dashboard)/employees"),
    },
    {
      label: "Active",
      value: loading ? "..." : String(metrics.activeEmployees),
      icon: (
        <MaterialCommunityIcons
          name="account-check"
          size={24}
          color={THEME.colors.success}
        />
      ),
      onPress: () => router.push("/(dashboard)/employees"),
    },
    {
      label: "Pending Leaves",
      value: loading ? "..." : String(metrics.pendingLeaves),
      icon: (
        <MaterialCommunityIcons
          name="clipboard-check-outline"
          size={24}
          color={THEME.colors.warning}
        />
      ),
      onPress: () => router.push("/(dashboard)/leaves"),
    },
    {
      label: "On Leave",
      value: loading ? "..." : String(metrics.onLeaveCount),
      icon: (
        <MaterialCommunityIcons
          name="beach"
          size={24}
          color={THEME.colors.info}
        />
      ),
      onPress: () => router.push("/(dashboard)/attendance"),
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
              {metricCards.map((metric, index) => (
                <View key={index} style={styles.metricCardWrapper}>
                  <MetricCard
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    onPress={metric.onPress}
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
            <View style={{ flexDirection: "row", gap: THEME.spacing.sm, marginBottom: THEME.spacing.sm }}>
              <Text style={{ fontSize: 20 }}>🤖</Text>
              <Text style={styles.sectionTitle}>AI Recommendations</Text>
            </View>
            <Text style={styles.aiText}>
              • View attendance trends and analytics in Insights tab
            </Text>
            <Text style={styles.aiText}>
              • Ask HR Assistant any HR-related questions
            </Text>
            <Text style={styles.aiText}>
              • Monitor payroll distribution and employee performance
            </Text>
            <View
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
            </View>
          </Pressable>

          {/* Quick Navigation */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: THEME.spacing.md }}>
            {[
              { icon: "account-plus", label: "Add Employee", route: "/(dashboard)/employees/add" as const },
              { icon: "calendar-check", label: "Attendance", route: "/(dashboard)/attendance" as const },
              { icon: "cash-multiple", label: "Payroll", route: "/(dashboard)/payroll" as const },
              { icon: "calendar-plus", label: "Leave Request", route: "/(dashboard)/leaves" as const },
            ].map((action, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(action.route)}
                style={({ pressed }) => ({
                  width: "48%",
                  backgroundColor: isDark
                    ? THEME.dark.background.tertiary
                    : THEME.light.background.tertiary,
                  borderRadius: THEME.borderRadius.md,
                  padding: THEME.spacing.md,
                  alignItems: "center",
                  gap: THEME.spacing.sm,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name={action.icon as any}
                  size={28}
                  color={THEME.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </Text>
              </Pressable>
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
