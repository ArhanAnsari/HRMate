/**
 * 🎨 PREMIUM DASHBOARD - Control Center
 * Key metrics, activity feed, AI insights, and quick actions
 * All data sourced from real Appwrite backend
 */

import { AttendanceChart, LeaveChart } from "@/src/components/Charts";
import { NotificationCenter } from "@/src/components/NotificationCenter";
import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { usePermissions } from "@/src/hooks/usePermissions";
import { analyticsService } from "@/src/services/analytics.service";
import { appwriteClient } from "@/src/services/appwrite";
import { employeeQueries } from "@/src/services/appwriteClient";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { useNotificationStore } from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import { Action } from "@/src/utils/permissions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown, Layout, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveCount: number;
  pendingLeaves: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { can } = usePermissions();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveCount: 0,
    pendingLeaves: 0,
  });

  const [attendanceTrendData, setAttendanceTrendData] = useState<{
    dates: string[];
    attendanceRates: number[];
  }>({ dates: [], attendanceRates: [] });

  const [leaveChartData, setLeaveChartData] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotificationStore();

  const loadDashboardData = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [empStats, leaveStats, attendanceTrends, leaveDistribution] =
        await Promise.all([
          employeeQueries.getEmployeeStats(user.companyId),
          leavesService.getLeaveStats(user.companyId).catch(() => ({
            pending: 0,
            approved: 0,
            rejected: 0,
          })),
          analyticsService.getAttendanceTrends(user.companyId),
          analyticsService.getLeaveDistribution(user.companyId),
        ]);

      setMetrics({
        totalEmployees: empStats.total,
        activeEmployees: empStats.active,
        onLeaveCount: empStats.onLeave,
        pendingLeaves: leaveStats.pending,
      });

      setAttendanceTrendData({
        dates: attendanceTrends.map((t) => t.day),
        attendanceRates: attendanceTrends.map((t) => t.rate),
      });

      setLeaveChartData({
        approved: leaveDistribution.approved,
        pending: leaveDistribution.pending,
        rejected: leaveDistribution.rejected,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    let unsubscribeEmp: () => void;
    let unsubscribeLeaves: () => void;

    loadDashboardData();

    if (user?.companyId) {
      // Subscriptions for automatic rapid updates
      const empChannel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.EMPLOYEES}.documents`;
      unsubscribeEmp = appwriteClient.subscribe(empChannel, () => {
        loadDashboardData();
      });

      const leaveChannel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.LEAVES}.documents`;
      unsubscribeLeaves = appwriteClient.subscribe(leaveChannel, () => {
        loadDashboardData();
      });
    }

    // Auto-refresh fallback
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (unsubscribeEmp) unsubscribeEmp();
      if (unsubscribeLeaves) unsubscribeLeaves();
    };
  }, [loadDashboardData, user?.companyId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: THEME.spacing.xl,
        }}
      >
        <View style={styles.content}>
          {/* Header Row */}
          <Animated.View
            entering={FadeInDown.springify()}
            style={{
              backgroundColor: THEME.colors.primary,
              borderRadius: THEME.borderRadius.xl,
              padding: THEME.spacing.lg,
              marginBottom: THEME.spacing.xl,
              ...THEME.shadows.md,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: THEME.typography.h3.fontSize,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    marginBottom: THEME.spacing.xs,
                  }}
                >
                  {getGreeting()}, {user?.name?.split(" ")[0] || "Manager"}! 👋
                </Text>
                <Text
                  style={{
                    fontSize: THEME.typography.bodySm.fontSize,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
              <Pressable
                onPress={() => setShowNotifications(true)}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={22}
                  color="#FFFFFF"
                />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: THEME.spacing.sm,
                      right: THEME.spacing.sm,
                      width: THEME.spacing.md - 2,
                      height: THEME.spacing.md - 2,
                      borderRadius: THEME.spacing.xs,
                      backgroundColor: THEME.colors.danger,
                      borderWidth: 2,
                      borderColor: THEME.colors.primary,
                    }}
                  />
                )}
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: THEME.spacing.md,
                gap: THEME.spacing.lg,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: THEME.spacing.xs }}>
                <MaterialCommunityIcons name="account-group-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  {loading ? "—" : `${metrics.totalEmployees} employees`}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: THEME.spacing.xs }}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
                  {loading ? "—" : `${metrics.pendingLeaves} pending leaves`}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Stats - Key Metrics */}
          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={styles.sectionTitle}
          >
            Quick Stats
          </Animated.Text>
          {loading ? (
            <SkeletonLoader type="card" count={2} />
          ) : (
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={styles.metricsGrid}
              layout={Layout.springify()}
            >
              {metricCards.map((metric, index) => (
                <Animated.View
                  key={index}
                  style={styles.metricCardWrapper}
                  entering={ZoomIn.delay(index * 100).springify()}
                >
                  <MetricCard
                    label={metric.label}
                    value={metric.value}
                    icon={metric.icon}
                    onPress={metric.onPress}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Charts Hub */}
          <Animated.Text
            entering={FadeInDown.delay(180).springify()}
            style={styles.sectionTitle}
          >
            Analytics Overview
          </Animated.Text>
          {loading ? (
            <SkeletonLoader type="card" count={2} />
          ) : (
            <Animated.View entering={FadeInDown.delay(190).springify()}>
              <PremiumCard
                style={{
                  marginBottom: THEME.spacing.lg,
                  alignItems: "center",
                  padding:
                    attendanceTrendData.dates.length > 0 ? 0 : THEME.spacing.md,
                }}
              >
                {attendanceTrendData.dates.length > 0 ? (
                  <>
                    <View style={{ width: "100%", padding: THEME.spacing.md }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          color: isDark
                            ? THEME.dark.text.primary
                            : THEME.light.text.primary,
                        }}
                      >
                        Attendance Trends
                      </Text>
                    </View>
                    <AttendanceChart data={attendanceTrendData} />
                  </>
                ) : (
                  <View
                    style={{
                      height: 120,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: isDark
                          ? THEME.dark.text.secondary
                          : THEME.light.text.secondary,
                      }}
                    >
                      No attendance data for the past 7 days
                    </Text>
                  </View>
                )}
              </PremiumCard>

              <PremiumCard
                style={{
                  marginBottom: THEME.spacing.lg,
                  alignItems: "center",
                  padding:
                    leaveChartData.approved +
                      leaveChartData.pending +
                      leaveChartData.rejected >
                    0
                      ? 0
                      : THEME.spacing.md,
                }}
              >
                {leaveChartData.approved +
                  leaveChartData.pending +
                  leaveChartData.rejected >
                0 ? (
                  <>
                    <View style={{ width: "100%", padding: THEME.spacing.md }}>
                      <Text
                        style={{
                          fontWeight: "600",
                          color: isDark
                            ? THEME.dark.text.primary
                            : THEME.light.text.primary,
                        }}
                      >
                        Leave Distribution
                      </Text>
                    </View>
                    <LeaveChart data={leaveChartData} />
                  </>
                ) : (
                  <View
                    style={{
                      height: 120,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: isDark
                          ? THEME.dark.text.secondary
                          : THEME.light.text.secondary,
                      }}
                    >
                      No leave distribution data
                    </Text>
                  </View>
                )}
              </PremiumCard>
            </Animated.View>
          )}

          {/* AI Insights Highlight */}
          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={styles.sectionTitle}
          >
            AI Insights
          </Animated.Text>
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <Pressable
              onPress={() => router.push("/(dashboard)/insights")}
              style={({ pressed }) => [
                styles.aiCard,
                pressed && { opacity: 0.6, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: THEME.spacing.sm,
                  marginBottom: THEME.spacing.sm,
                }}
              >
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
          </Animated.View>

          {/* Quick Navigation */}
          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={styles.sectionTitle}
          >
            Quick Actions
          </Animated.Text>
          <Animated.View
            entering={FadeInDown.delay(350).springify()}
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: THEME.spacing.md,
            }}
          >
            {[
              {
                icon: "account-plus",
                label: "Add Employee",
                route: "/(dashboard)/employees/add" as const,
                color: THEME.colors.primary,
                bgColor: THEME.colors.primaryLight,
              },
              {
                icon: "calendar-check",
                label: "Attendance",
                route: "/(dashboard)/attendance" as const,
                color: THEME.colors.success,
                bgColor: "#D1FAE5",
              },
              {
                icon: "cash-multiple",
                label: "Payroll",
                route: "/(dashboard)/payroll" as const,
                color: THEME.colors.warning,
                bgColor: "#FEF3C7",
              },
              {
                icon: "calendar-plus",
                label: "Leave Request",
                route: "/(dashboard)/leaves" as const,
                color: THEME.colors.info,
                bgColor: "#CFFAFE",
              },
            ].map((action, index) => (
              <PremiumCard
                key={index}
                interactive
                onPress={() => router.push(action.route)}
                style={{ width: "48%" }}
              >
                <View style={{ alignItems: "center", gap: THEME.spacing.sm }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: THEME.borderRadius.lg,
                      backgroundColor: action.bgColor,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name={action.icon as any}
                      size={24}
                      color={action.color}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: isDark
                        ? THEME.dark.text.primary
                        : THEME.light.text.primary,
                      textAlign: "center",
                    }}
                  >
                    {action.label}
                  </Text>
                </View>
              </PremiumCard>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      {can(Action.ADD_EMPLOYEE) && (
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
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <NotificationCenter
          onClose={() => setShowNotifications(false)}
          userId={user?.$id}
        />
      </Modal>
    </SafeAreaView>
  );
}
