/**
 * 🏖️ LEAVES SCREEN - Premium Design
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { leaveService } from "@/src/services/domain.service";
import { THEME } from "@/src/theme";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

export default function LeavesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaveData();
  }, []);

  const loadLeaveData = async () => {
    setLoading(true);
    try {
      const [stats, requests] = await Promise.all([
        leaveService.getLeaveStats(),
        leaveService.getLeaveRequests(),
      ]);
      setLeaveStats(stats);
      setLeaveRequests(requests);
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

  const renderLeaveRequest = ({ item }: { item: any }) => (
    <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
      <View style={{ marginBottom: THEME.spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: THEME.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.type}
          </Text>
          <View
            style={{
              backgroundColor:
                item.status === "approved"
                  ? "rgba(76, 175, 80, 0.1)"
                  : item.status === "pending"
                    ? "rgba(255, 193, 7, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
              paddingHorizontal: THEME.spacing.sm,
              paddingVertical: 2,
              borderRadius: THEME.borderRadius.sm,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  item.status === "approved"
                    ? THEME.colors.success
                    : item.status === "pending"
                      ? THEME.colors.warning
                      : THEME.colors.danger,
              }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: THEME.spacing.lg }}>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            From
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.startDate}
          </Text>
        </View>
        {item.endDate && (
          <View>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              To
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              {item.endDate}
            </Text>
          </View>
        )}
        <View>
          <Text
            style={{
              fontSize: 12,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            Days
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.days}
          </Text>
        </View>
      </View>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={leaveRequests}
        renderItem={renderLeaveRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLeaveData} />
        }
        ListHeaderComponent={() => (
          <View>
            <Text style={titleStyle}>Leaves</Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Your leave balance and requests
            </Text>

            {leaveStats && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginBottom: THEME.spacing.lg,
                  gap: THEME.spacing.md,
                }}
              >
                <View style={{ width: "48%" }}>
                  <MetricCard
                    label="Total Days"
                    value={leaveStats.totalDays.toString()}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <MetricCard
                    label="Remaining"
                    value={leaveStats.remainingDays.toString()}
                    trend={{ direction: "up", percentage: 5 }}
                  />
                </View>
              </View>
            )}

            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
                marginBottom: THEME.spacing.md,
              }}
            >
              My Requests
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
