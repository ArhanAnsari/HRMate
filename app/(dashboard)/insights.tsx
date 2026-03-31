/**
 * 💡 INSIGHTS SCREEN - AI-Powered HR Analytics
 * Real-time insights, trends, and smart recommendations powered by Gemini AI
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { AttendanceChart, PayrollChart, LeaveChart } from "@/src/components/Charts";
import { THEME } from "@/src/theme";
import GeminiAIService from "@/src/services/gemini-ai.service";
import { useAuthStore } from "@/src/state/auth.store";
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
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [metrics] = useState({
    attendanceRate: 92,
    avgSalary: 65000,
    totalEmployees: 30,
    activeEmployees: 28,
    onLeaveCount: 2,
    pendingLeavesCount: 5,
  });

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      const [insights, recs] = await Promise.all([
        GeminiAIService.generateAIInsights({
          totalEmployees: metrics.totalEmployees,
          activeEmployees: metrics.activeEmployees,
          attendanceRate: metrics.attendanceRate,
          avgSalary: metrics.avgSalary,
          onLeaveCount: metrics.onLeaveCount,
          pendingLeavesCount: metrics.pendingLeavesCount,
        }),
        GeminiAIService.getSmartRecommendations({
          lowAttendanceEmployees: 3,
          highTurnoverRate: 8,
          pendingLeavesCount: metrics.pendingLeavesCount,
          unprocessedPayroll: 0,
        }),
      ]);

      setAiInsights(insights);
      setRecommendations(recs);
    } catch (error) {
      console.error("Failed to load AI insights:", error);
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
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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
            onPress={loadAIInsights}
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
                color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
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
            label="Avg Attendance"
            value={`${metrics.attendanceRate}%`}
            trend={{ direction: "up", percentage: 5 }}
          />
          <MetricCard
            label="Active Employees"
            value={String(metrics.activeEmployees)}
            trend={{ direction: "up", percentage: 2 }}
          />
          <MetricCard
            label="Pending Requests"
            value={String(metrics.pendingLeavesCount)}
            trend={{ direction: "down", percentage: 3 }}
          />
          <MetricCard
            label="On Leave Today"
            value={String(metrics.onLeaveCount)}
            trend={{ direction: "neutral", percentage: 0 }}
          />
        </View>

        {/* Charts - Attendance Trend */}
        <Text style={sectionTitleStyle}>📈 Attendance Trends</Text>
        <PremiumCard style={{ marginBottom: THEME.spacing.lg, alignItems: "center", padding: 0 }}>
          <AttendanceChart
            data={{
              dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              attendanceRates: [88, 90, 92, 89, 95, 85],
            }}
          />
        </PremiumCard>

        {/* Charts - Leave Distribution */}
        <Text style={sectionTitleStyle}>🗓️ Leave Distribution</Text>
        <PremiumCard style={{ marginBottom: THEME.spacing.lg, alignItems: "center", padding: 0 }}>
          <LeaveChart
            data={{
              approved: 15,
              pending: 5,
              rejected: 2,
            }}
          />
        </PremiumCard>

        {/* Smart Recommendations */}
        <Text style={sectionTitleStyle}>💡 Smart Recommendations</Text>
        {loading ? (
          <SkeletonLoader type="text" count={3} />
        ) : (
          <View style={{ gap: THEME.spacing.md, marginBottom: THEME.spacing.lg }}>
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
                    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
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