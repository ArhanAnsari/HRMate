/**
 * 💡 INSIGHTS SCREEN - AI-Powered HR Analytics
 * Real-time insights, trends, and smart recommendations powered by Gemini AI
 */

import { AttendanceChart, LeaveChart } from "@/src/components/Charts";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { analyticsService } from "@/src/services/analytics.service";
import { attendanceService } from "@/src/services/attendance.service";
import { employeeService } from "@/src/services/domain.service";
import GeminiAIService from "@/src/services/gemini-ai.service";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Animated,
    ScrollView,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    attendanceRate: 0,
    avgSalary: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    onLeaveCount: 0,
    pendingLeavesCount: 0,
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

  useEffect(() => {
    if (user?.companyId) {
      loadData();
    }
  }, [user?.companyId]);

  const loadData = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all real data in parallel
      const [
        statsData,
        pendingLeaves,
        employees,
        leaveDistribution,
        attendanceTrends,
        payrollDistribution,
      ] = await Promise.all([
        attendanceService.getTodayStats(user.companyId),
        leavesService.getPendingLeaves(user.companyId),
        employeeService.getEmployees(user.companyId),
        analyticsService.getLeaveDistribution(user.companyId),
        analyticsService.getAttendanceTrends(user.companyId),
        analyticsService.getPayrollDistribution(user.companyId),
      ]);

      // Calculate metrics from real data
      const totalEmployees = employees?.length || 0;
      const activeEmployees =
        (statsData?.present || 0) +
        (statsData?.onLeave || 0) +
        (statsData?.lateArrivals || 0);
      const attendanceRate =
        totalEmployees > 0
          ? Math.round(((statsData?.present || 0) / totalEmployees) * 100)
          : 0;
      const onLeaveCount = statsData?.onLeave || 0;
      const pendingLeavesCount = pendingLeaves?.length || 0;
      const avgSalary = payrollDistribution.avgSalary;

      setMetrics({
        attendanceRate,
        avgSalary,
        totalEmployees,
        activeEmployees,
        onLeaveCount,
        pendingLeavesCount,
      });

      // Real attendance trend for chart
      setAttendanceTrendData({
        dates: attendanceTrends.map((t) => t.day),
        attendanceRates: attendanceTrends.map((t) => t.rate),
      });

      setLeaveChartData({
        approved: leaveDistribution.approved,
        pending: leaveDistribution.pending,
        rejected: leaveDistribution.rejected,
      });

      // Load AI insights with real data
      const [insights, recs] = await Promise.all([
        GeminiAIService.generateAIInsights({
          totalEmployees,
          activeEmployees,
          attendanceRate,
          avgSalary,
          onLeaveCount,
          pendingLeavesCount,
        }),
        GeminiAIService.getSmartRecommendations({
          lowAttendanceEmployees: Math.max(0, totalEmployees - activeEmployees),
          highTurnoverRate:
            totalEmployees > 0
              ? Math.round(
                  (employees.filter((e: any) => e.status === "inactive")
                    .length /
                    totalEmployees) *
                    100,
                )
              : 0,
          pendingLeavesCount,
          unprocessedPayroll: 0,
        }),
      ]);

      setAiInsights(insights);
      setRecommendations(recs);
    } catch (err) {
      console.error("Failed to load insights data:", err);
      setError("Failed to load insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const sectionTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  };

  const emptyChartStyle: ViewStyle = {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: isDark
      ? THEME.dark.background.tertiary
      : THEME.light.background.tertiary,
    borderRadius: THEME.borderRadius.md,
  };

  const hasAttendanceData = attendanceTrendData.dates.length > 0;

  const hasLeaveData =
    leaveChartData.approved + leaveChartData.pending + leaveChartData.rejected >
    0;

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <ScrollView style={contentStyle}>
          <Text style={titleStyle}>Insights</Text>
          <SkeletonLoader
            width="100%"
            height={200}
            style={{ marginBottom: THEME.spacing.md }}
          />
          <SkeletonLoader width="100%" height={200} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={containerStyle}>
        <View
          style={[
            contentStyle,
            { flex: 1, justifyContent: "center", alignItems: "center" },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={THEME.colors.danger}
          />
          <Text
            style={[
              titleStyle,
              { textAlign: "center", marginTop: THEME.spacing.md },
            ]}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              marginTop: THEME.spacing.md,
              padding: THEME.spacing.sm,
              backgroundColor: THEME.colors.primary,
              borderRadius: THEME.borderRadius.sm,
            }}
            onPress={loadData}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <Animated.ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={titleStyle}>Insights</Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
              }}
            >
              AI-powered HR analytics
            </Text>
          </View>
          <TouchableOpacity
            onPress={loadData}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: THEME.colors.primary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Error state */}
        {error && (
          <PremiumCard
            style={{
              marginTop: THEME.spacing.lg,
              flexDirection: "row",
              gap: THEME.spacing.md,
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color={THEME.colors.danger}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: THEME.colors.danger,
              }}
            >
              {error}
            </Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={{ color: THEME.colors.primary, fontWeight: "600" }}>
                Retry
              </Text>
            </TouchableOpacity>
          </PremiumCard>
        )}

        {/* AI Generated Insights */}
        <Text style={sectionTitleStyle}>🤖 AI Summary</Text>
        {loading ? (
          <SkeletonLoader type="card" count={1} />
        ) : (
          <PremiumCard style={{ marginBottom: THEME.spacing.lg }}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              {aiInsights || "No AI insights available at the moment."}
            </Text>
          </PremiumCard>
        )}

        {/* Key Metrics */}
        <Text style={sectionTitleStyle}>📊 Key Metrics</Text>
        {loading ? (
          <SkeletonLoader type="card" count={4} />
        ) : (
          <View
            style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}
          >
            <MetricCard
              label="Attendance Rate"
              value={`${metrics.attendanceRate}%`}
              trend={{
                direction: metrics.attendanceRate >= 85 ? "up" : "down",
                percentage: metrics.attendanceRate,
              }}
            />
            <MetricCard
              label="Active Employees"
              value={String(metrics.activeEmployees)}
              trend={{
                direction:
                  metrics.activeEmployees > metrics.totalEmployees * 0.8
                    ? "up"
                    : "down",
                percentage:
                  metrics.totalEmployees > 0
                    ? Math.round(
                        (metrics.activeEmployees / metrics.totalEmployees) *
                          100,
                      )
                    : 0,
              }}
            />
            {metrics.avgSalary > 0 && (
              <MetricCard
                label="Avg. Salary"
                value={`$${metrics.avgSalary.toLocaleString()}`}
                trend={{ direction: "up", percentage: 0 }}
              />
            )}
            <MetricCard
              label="Pending Leave Requests"
              value={String(metrics.pendingLeavesCount)}
              trend={{
                direction: metrics.pendingLeavesCount > 3 ? "down" : "up",
                percentage: metrics.pendingLeavesCount,
              }}
            />
            <MetricCard
              label="On Leave Today"
              value={String(metrics.onLeaveCount)}
              trend={{
                direction: "neutral",
                percentage:
                  metrics.totalEmployees > 0
                    ? Math.round(
                        (metrics.onLeaveCount / metrics.totalEmployees) * 100,
                      )
                    : 0,
              }}
            />
          </View>
        )}

        {/* Charts - Attendance Trend */}
        <Text style={sectionTitleStyle}>📈 Attendance Trends (7 days)</Text>
        <PremiumCard
          style={{
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
            padding: hasAttendanceData ? 0 : THEME.spacing.md,
          }}
        >
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : hasAttendanceData ? (
            <AttendanceChart data={attendanceTrendData} />
          ) : (
            <View style={emptyChartStyle}>
              <MaterialCommunityIcons
                name="chart-line"
                size={32}
                color={
                  isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
                }
              />
              <Text
                style={{
                  marginTop: THEME.spacing.sm,
                  fontSize: 13,
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

        {/* Charts - Leave Distribution */}
        <Text style={sectionTitleStyle}>🗓️ Leave Distribution</Text>
        <PremiumCard
          style={{
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
            padding: hasLeaveData ? 0 : THEME.spacing.md,
          }}
        >
          {loading ? (
            <SkeletonLoader type="card" count={1} />
          ) : hasLeaveData ? (
            <>
              <LeaveChart data={leaveChartData} />
              {/* Legend */}
              <View
                style={{
                  flexDirection: "row",
                  gap: THEME.spacing.lg,
                  paddingVertical: THEME.spacing.md,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {[
                  {
                    label: `Approved (${leaveChartData.approved})`,
                    color: THEME.colors.success,
                  },
                  {
                    label: `Pending (${leaveChartData.pending})`,
                    color: THEME.colors.warning,
                  },
                  {
                    label: `Rejected (${leaveChartData.rejected})`,
                    color: THEME.colors.danger,
                  },
                ].map(({ label, color }) => (
                  <View
                    key={label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: color,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark
                          ? THEME.dark.text.secondary
                          : THEME.light.text.secondary,
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={emptyChartStyle}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={32}
                color={
                  isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
                }
              />
              <Text
                style={{
                  marginTop: THEME.spacing.sm,
                  fontSize: 13,
                  color: isDark
                    ? THEME.dark.text.secondary
                    : THEME.light.text.secondary,
                }}
              >
                No leave requests found
              </Text>
            </View>
          )}
        </PremiumCard>

        {/* Smart Recommendations */}
        <Text style={sectionTitleStyle}>💡 Smart Recommendations</Text>
        {loading ? (
          <SkeletonLoader type="text" count={3} />
        ) : (
          <View
            style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}
          >
            {recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <PremiumCard
                  key={idx}
                  style={{
                    flexDirection: "row",
                    gap: THEME.spacing.md,
                    alignItems: "flex-start",
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: THEME.colors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="lightbulb"
                      size={16}
                      color="#fff"
                    />
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 14,
                      lineHeight: 20,
                      color: isDark
                        ? THEME.dark.text.primary
                        : THEME.light.text.primary,
                    }}
                  >
                    {rec}
                  </Text>
                </PremiumCard>
              ))
            ) : (
              <PremiumCard>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark
                      ? THEME.dark.text.secondary
                      : THEME.light.text.secondary,
                    textAlign: "center",
                  }}
                >
                  No AI-powered recommendations available at the moment.
                </Text>
              </PremiumCard>
            )}
          </View>
        )}

        <View style={{ height: THEME.spacing.xl }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
