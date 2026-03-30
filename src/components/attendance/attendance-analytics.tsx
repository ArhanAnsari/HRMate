import React from "react";
import { Text, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";

interface AttendanceAnalyticsProps {
  present: number;
  absent: number;
  halfDay: number;
  onLeave: number;
  workingDays?: number;
}

export const AttendanceAnalytics: React.FC<AttendanceAnalyticsProps> = ({
  present,
  absent,
  halfDay,
  onLeave,
  workingDays = 22,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const total = present + absent + halfDay + onLeave;
  const attendancePercentage =
    total > 0 ? Math.round((present / total) * 100) : 0;

  const StatBox = ({
    label,
    value,
    color,
    percentage,
  }: {
    label: string;
    value: number;
    color: string;
    percentage?: number;
  }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
        borderRadius: 12,
        padding: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: color,
        marginBottom: Spacing.md,
      }}
    >
      <Text
        style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color }}>{value}</Text>
        {percentage !== undefined && (
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {percentage}%
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View>
      {/* Attendance Percentage */}
      <View
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
          borderRadius: 12,
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
          alignItems: "center",
        }}
      >
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}
        >
          Attendance Rate
        </Text>
        <Text style={{ fontSize: 48, fontWeight: "700", color: "#10b981" }}>
          {attendancePercentage}%
        </Text>
        <View
          style={{
            width: "100%",
            height: 8,
            backgroundColor: isDark ? "#333" : "#e5e7eb",
            borderRadius: 4,
            marginTop: Spacing.md,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${attendancePercentage}%`,
              height: "100%",
              backgroundColor: "#10b981",
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View
        style={{
          flexDirection: "row",
          gap: Spacing.md,
          marginBottom: Spacing.md,
        }}
      >
        <View style={{ flex: 1 }}>
          <StatBox label="Present" value={present} color="#10b981" />
        </View>
        <View style={{ flex: 1 }}>
          <StatBox label="Absent" value={absent} color="#ef4444" />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: Spacing.md,
          marginBottom: Spacing.lg,
        }}
      >
        <View style={{ flex: 1 }}>
          <StatBox label="Half Day" value={halfDay} color="#f59e0b" />
        </View>
        <View style={{ flex: 1 }}>
          <StatBox label="On Leave" value={onLeave} color="#06b6d4" />
        </View>
      </View>

      {/* Summary */}
      <View
        style={{
          backgroundColor: "#f0fdf4",
          borderRadius: 12,
          padding: Spacing.lg,
          borderLeftWidth: 4,
          borderLeftColor: "#10b981",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#15803d",
            marginBottom: 8,
          }}
        >
          💡 Summary
        </Text>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, color: "#166534", lineHeight: 18 }}>
            • Total working days:{" "}
            <Text style={{ fontWeight: "600" }}>{workingDays}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: "#166534", lineHeight: 18 }}>
            • Days marked: <Text style={{ fontWeight: "600" }}>{total}</Text>
          </Text>
          <Text style={{ fontSize: 12, color: "#166534", lineHeight: 18 }}>
            • Effective attendance:{" "}
            <Text style={{ fontWeight: "600" }}>{attendancePercentage}%</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
