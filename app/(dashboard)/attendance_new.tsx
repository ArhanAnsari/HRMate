/**
 * 📋 ATTENDANCE SCREEN - Daily attendance tracking & analytics
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { THEME } from "@/src/theme";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    Text,
    TextStyle,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: "present" | "late" | "absent" | "half-day";
}

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [searchText, setSearchText] = useState("");

  const attendanceRecords: AttendanceRecord[] = [
    {
      id: "1",
      employeeName: "John Doe",
      date: "Mar 30, 2026",
      checkIn: "09:15 AM",
      checkOut: "05:45 PM",
      hours: 8.5,
      status: "present",
    },
    {
      id: "2",
      employeeName: "Sarah Smith",
      date: "Mar 30, 2026",
      checkIn: "10:30 AM",
      checkOut: "06:00 PM",
      hours: 7.5,
      status: "late",
    },
  ];

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

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>Attendance</Text>
        <SearchBar
          placeholder="Search..."
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={() => {}}
        />
      </View>

      <View style={metricsGridStyle}>
        {[
          { label: "Present", value: "24", trend: "up" },
          { label: "On Time", value: "18", trend: "down" },
          { label: "Late", value: "4", trend: "up" },
          { label: "Absent", value: "2", trend: "neutral" },
        ].map((m, i) => (
          <View key={i} style={metricItemStyle}>
            <MetricCard
              label={m.label}
              value={m.value}
              trend={{ direction: m.trend as any, percentage: 5 }}
            />
          </View>
        ))}
      </View>

      <FlatList
        data={attendanceRecords}
        renderItem={({ item }) => (
          <PremiumCard interactive style={recordCardStyle}>
            <View style={recordRowStyle}>
              <Text style={recordValueStyle}>{item.employeeName}</Text>
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: getStatusColor(item.status),
                }}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={recordRowStyle}>
              <Text style={recordLabelStyle}>Check In</Text>
              <Text style={recordValueStyle}>{item.checkIn}</Text>
            </View>
            <View style={recordRowStyle}>
              <Text style={recordLabelStyle}>Check Out</Text>
              <Text style={recordValueStyle}>{item.checkOut}</Text>
            </View>
            <View style={recordRowStyle}>
              <Text style={recordLabelStyle}>Hours</Text>
              <Text style={recordValueStyle}>{item.hours}h</Text>
            </View>
          </PremiumCard>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listContainerStyle}
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
