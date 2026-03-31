/**
 * ATTENDANCE SCREEN - Daily attendance tracking & analytics
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import {
  AttendanceRecord,
  attendanceService,
  AttendanceStats,
} from "@/src/services/attendance.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendanceData = useCallback(async () => {
    if (!user?.companyId) {
      setLoading(false);
      return;
    }

    try {
      const [todayStats, todayRecords] = await Promise.all([
        attendanceService.getTodayStats(user.companyId),
        attendanceService.getTodayRecords(user.companyId),
      ]);
      setStats(todayStats);
      setAttendanceRecords(todayRecords || []);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendanceData();
    setRefreshing(false);
  };

  const filteredRecords = attendanceRecords.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  };
  const headerTitleStyle: TextStyle = {
    fontSize: THEME.typography.h3.fontSize,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
  };
  const metricsGridStyle: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    gap: THEME.spacing.md,
  };
  const metricItemStyle: ViewStyle = { flex: 1, minWidth: "48%" };
  const listContainerStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  };
  const recordCardStyle: ViewStyle = { marginBottom: THEME.spacing.md };
  const recordRowStyle: ViewStyle = {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: THEME.spacing.sm,
  };
  const recordLabelStyle: TextStyle = {
    fontSize: THEME.typography.bodySm.fontSize,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
  };
  const recordValueStyle: TextStyle = {
    fontSize: THEME.typography.body.fontSize,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "present":
        return THEME.colors.success;
      case "late":
        return THEME.colors.warning;
      case "absent":
        return THEME.colors.danger;
      default:
        return THEME.colors.info;
    }
  };

  // Calculate percentages based on actual data
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { direction: "neutral" as const, percentage: 0 };
    const change = ((current - previous) / previous) * 100;
    const direction: "up" | "down" | "neutral" =
      change > 0 ? "up" : change < 0 ? "down" : "neutral";
    return {
      direction,
      percentage: Math.abs(Math.round(change)),
    };
  };

  const totalEmployees =
    (stats?.present || 0) + (stats?.absent || 0) + (stats?.onLeave || 0);
  const presentPercentage =
    totalEmployees > 0
      ? Math.round(((stats?.present || 0) / totalEmployees) * 100)
      : 0;
  const onTimePercentage =
    totalEmployees > 0
      ? Math.round(((stats?.presentOnTime || 0) / totalEmployees) * 100)
      : 0;
  const latePercentage =
    totalEmployees > 0
      ? Math.round(((stats?.lateArrivals || 0) / totalEmployees) * 100)
      : 0;
  const absentPercentage =
    totalEmployees > 0
      ? Math.round(((stats?.absent || 0) / totalEmployees) * 100)
      : 0;

  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>Attendance</Text>
        <SearchBar
          placeholder="Search employees..."
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={() => {}}
        />
      </View>

      <View style={metricsGridStyle}>
        <View style={metricItemStyle}>
          <MetricCard
            label="Present"
            value={stats?.present?.toString() || "0"}
            trend={{
              direction: presentPercentage > 50 ? "up" : "down",
              percentage: presentPercentage,
            }}
          />
        </View>
        <View style={metricItemStyle}>
          <MetricCard
            label="On Time"
            value={stats?.presentOnTime?.toString() || "0"}
            trend={{
              direction: onTimePercentage > 50 ? "up" : "down",
              percentage: onTimePercentage,
            }}
          />
        </View>
        <View style={metricItemStyle}>
          <MetricCard
            label="Late"
            value={stats?.lateArrivals?.toString() || "0"}
            trend={{
              direction: latePercentage < 20 ? "down" : "up",
              percentage: latePercentage,
            }}
          />
        </View>
        <View style={metricItemStyle}>
          <MetricCard
            label="Absent"
            value={stats?.absent?.toString() || "0"}
            trend={{
              direction: absentPercentage < 10 ? "down" : "up",
              percentage: absentPercentage,
            }}
          />
        </View>
      </View>

      <FlatList
        data={filteredRecords}
        renderItem={({ item }) => (
          <PremiumCard interactive style={recordCardStyle}>
            <View style={recordRowStyle}>
              <Text style={recordValueStyle}>{item.name}</Text>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: getStatusColor(item.status || "absent"),
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}
                >
                  {(item.status || "ABSENT").toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={recordRowStyle}>
              <Text style={recordLabelStyle}>Check In</Text>
              <Text style={recordValueStyle}>{item.checkIn || "-"}</Text>
            </View>
            <View style={recordRowStyle}>
              <Text style={recordLabelStyle}>Check Out</Text>
              <Text style={recordValueStyle}>{item.checkOut || "-"}</Text>
            </View>
            {item.hoursWorked && (
              <View style={recordRowStyle}>
                <Text style={recordLabelStyle}>Hours</Text>
                <Text style={recordValueStyle}>{item.hoursWorked}h</Text>
              </View>
            )}
          </PremiumCard>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listContainerStyle}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        onPress={() => {}}
        options={[
          { icon: "check-circle", label: "Check In", onPress: () => {} },
          {
            icon: "check-circle-outline",
            label: "Check Out",
            onPress: () => {},
          },
        ]}
        position="bottom-right"
      />
    </SafeAreaView>
  );
}
