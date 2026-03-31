/**
 * 💡 INSIGHTS SCREEN - AI-Powered HR Analytics
 * Real-time insights, trends, and smart recommendations powered by Gemini AI
 */

import { AttendanceChart, LeaveChart } from "@/src/components/Charts";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { attendanceService } from "@/src/services/attendance.service";
import { employeeService } from "@/src/services/domain.service";
import GeminiAIService from "@/src/services/gemini-ai.service";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
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
      // Fetch all real data
      const [statsData, leaveStats, employees, leaveDistribution] =
        await Promise.all([
          attendanceService.getTodayStats(user.companyId),
          leavesService.getPendingLeaves(user.companyId),
          employeeService.getEmployees(user.companyId),
          leavesService.getLeaveStats(user.companyId),
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
      const pendingLeavesCount = leaveStats?.length || 0;

      setMetrics({
        attendanceRate,
        avgSalary: 65000, // TODO: Calculate from actual payroll data
        totalEmployees,
        activeEmployees,
        onLeaveCount,
        pendingLeavesCount,
      });

      setLeaveChartData({
        approved: leaveDistribution?.approved || 0,
        pending: leaveDistribution?.pending || 0,
        rejected: leaveDistribution?.rejected || 0,
      });

      // Load AI insights
      const [insights, recs] = await Promise.all([
        GeminiAIService.generateAIInsights({
          totalEmployees,
          activeEmployees,
          attendanceRate,
          avgSalary: 65000,
          onLeaveCount,
          pendingLeavesCount,
        }),
        GeminiAIService.getSmartRecommendations({
          lowAttendanceEmployees: Math.max(0, totalEmployees - activeEmployees),
          highTurnoverRate: 8,
          pendingLeavesCount,
          unprocessedPayroll: 0,
        }),
      ]);

      setAiInsights(insights);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load insights data:", error);
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

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
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
              {aiInsights}
            </Text>
          </PremiumCard>
        )}

        {/* Key Metrics */}
        <Text style={sectionTitleStyle}>📊 Key Metrics</Text>
        <View style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}>
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
                      (metrics.activeEmployees / metrics.totalEmployees) * 100,
                    )
                  : 0,
            }}
          />
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

        {/* Charts - Attendance Trend */}
        <Text style={sectionTitleStyle}>📈 Attendance Trends</Text>
        <PremiumCard
          style={{
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
            padding: 0,
          }}
        >
          <AttendanceChart
            data={{
              dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              attendanceRates: [88, 90, 92, 89, 95, 85],
            }}
          />
        </PremiumCard>

        {/* Charts - Leave Distribution */}
        <Text style={sectionTitleStyle}>🗓️ Leave Distribution</Text>
        <PremiumCard
          style={{
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
            padding: 0,
          }}
        >
          <LeaveChart data={leaveChartData} />
        </PremiumCard>

        {/* Smart Recommendations */}
        <Text style={sectionTitleStyle}>💡 Smart Recommendations</Text>
        {loading ? (
          <SkeletonLoader type="text" count={3} />
        ) : (
          <View
            style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}
          >
            {recommendations.map((rec, idx) => (
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
            ))}
          </View>
        )}

        <View style={{ height: THEME.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}
