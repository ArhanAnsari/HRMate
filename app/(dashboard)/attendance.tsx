/**
 * 📊 ATTENDANCE SCREEN - Premium Design with Metrics
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import {
  AttendanceRecord,
  AttendanceStats,
  attendanceService,
} from "@/src/services/attendance.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
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

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user?.companyId) {
      loadAttendanceData();
    }
  }, [user?.companyId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(
        records.filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, records]);

  const loadAttendanceData = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const [todayStats, todayRecords] = await Promise.all([
        attendanceService.getTodayStats(user.companyId),
        attendanceService.getTodayRecords(user.companyId),
      ]);
      setStats(todayStats);
      setRecords(todayRecords);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const headerStyle: ViewStyle = {
    marginBottom: THEME.spacing.lg,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 14,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
  };

  const metricsGridStyle: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: THEME.spacing.lg,
    gap: THEME.spacing.md,
  };

  const metricItemStyle: ViewStyle = {
    width: "48%",
    marginBottom: THEME.spacing.sm,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
  };

  const renderMetricsGrid = () => {
    if (!stats) return null;

    const metrics = [
      {
        label: "Present",
        value: stats.present.toString(),
        icon: (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={THEME.colors.primary}
          />
        ),
      },
      {
        label: "Absent",
        value: stats.absent.toString(),
        icon: (
          <MaterialCommunityIcons
            name="close-circle"
            size={24}
            color={THEME.colors.danger}
          />
        ),
      },
      {
        label: "On Time",
        value: stats.presentOnTime.toString(),
        icon: (
          <MaterialCommunityIcons
            name="clock"
            size={24}
            color={THEME.colors.success}
          />
        ),
      },
      {
        label: "Late",
        value: stats.lateArrivals.toString(),
        icon: (
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={THEME.colors.warning}
          />
        ),
      },
    ];

    return (
      <View style={metricsGridStyle}>
        {metrics.map((metric, index) => (
          <View key={index} style={metricItemStyle}>
            <MetricCard
              label={metric.label}
              value={metric.value}
              trend={
                metric.label === "Absent"
                  ? { direction: "down", percentage: 5 }
                  : metric.label === "Late"
                    ? { direction: "up", percentage: 2 }
                    : undefined
              }
              icon={metric.icon}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderAttendanceRecord = ({ item }: { item: AttendanceRecord }) => {
    const statusColors: Record<string, string> = {
      present: THEME.colors.success,
      absent: THEME.colors.danger,
      late: THEME.colors.warning,
    };

    return (
      <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              {item.name}
            </Text>
            <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
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
                  Check In
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
                  {item.checkIn}
                </Text>
              </View>
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
                  Check Out
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
                  {item.checkOut}
                </Text>
              </View>
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
                  Duration
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
                  {item.duration}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: statusColors[item.status],
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "white", fontWeight: "600" }}>
              {item.status === "present"
                ? "✓"
                : item.status === "late"
                  ? "!"
                  : "✕"}
            </Text>
          </View>
        </View>
      </PremiumCard>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAttendanceData} />
        }
        ListHeaderComponent={() => (
          <View>
            <View style={headerStyle}>
              <Text style={titleStyle}>Attendance</Text>
              <Text style={subtitleStyle}>Today's attendance overview</Text>
            </View>

            {renderMetricsGrid()}

            <Text style={sectionTitleStyle}>Attendance Records</Text>
            <SearchBar
              placeholder="Search employee..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginBottom: THEME.spacing.md }}
            />
          </View>
        )}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}
