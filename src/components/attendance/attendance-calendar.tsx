import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";
import { AttendanceRecord } from "../../types";

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
  currentMonth?: Date;
  onDateSelect?: (date: Date) => void;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  attendanceRecords,
  currentMonth = new Date(),
  onDateSelect,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create array of days for calendar
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Helper to get attendance status for a date
  const getAttendanceStatus = (date: number): AttendanceRecord | undefined => {
    const dateStr = new Date(year, month, date).toISOString().split("T")[0];
    return attendanceRecords.find((r) => r.date.split("T")[0] === dateStr);
  };

  // Helper to get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present":
        return "#10b981";
      case "absent":
        return "#ef4444";
      case "half_day":
        return "#f59e0b";
      case "on_leave":
        return "#06b6d4";
      default:
        return isDark ? "#333" : "#f3f4f6";
    }
  };

  // Helper to get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "present":
        return "✓";
      case "absent":
        return "✕";
      case "half_day":
        return "◐";
      case "on_leave":
        return "●";
      default:
        return "";
    }
  };

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      {/* Month Header */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: colors.text,
          marginBottom: Spacing.md,
          textAlign: "center",
        }}
      >
        {currentMonth.toLocaleString("en-IN", {
          month: "long",
          year: "numeric",
        })}
      </Text>

      {/* Weekday Headers */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: Spacing.sm,
          backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View
            key={day}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.textSecondary,
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 2,
          backgroundColor: isDark ? "#0f0f0f" : "#f3f4f6",
          borderRadius: 8,
          padding: 2,
        }}
      >
        {days.map((day, index) => {
          const attendance = day ? getAttendanceStatus(day) : undefined;
          const status = attendance?.status;
          const bgColor = getStatusColor(status);
          const icon = getStatusIcon(status);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (day && onDateSelect) {
                  onDateSelect(new Date(year, month, day));
                }
              }}
              style={{
                flex: 1,
                aspectRatio: 1,
                maxWidth: "14.285%",
                backgroundColor: day ? bgColor : "transparent",
                borderRadius: 6,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: day ? bgColor : isDark ? "#1f1f1f" : "#e5e7eb",
              }}
            >
              {day && (
                <View style={{ alignItems: "center", gap: 2 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        status && status !== "absent"
                          ? "#fff"
                          : isDark
                            ? "#999"
                            : "#666",
                    }}
                  >
                    {day}
                  </Text>
                  {icon && (
                    <Text
                      style={{
                        fontSize: 10,
                        color:
                          status && status !== "absent"
                            ? "#fff"
                            : isDark
                              ? "#999"
                              : "#666",
                      }}
                    >
                      {icon}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View
        style={{
          marginTop: Spacing.lg,
          backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
          borderRadius: 8,
          padding: Spacing.md,
          gap: Spacing.sm,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: "#10b981",
            }}
          />
          <Text style={{ fontSize: 12, color: colors.text }}>Present</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: "#ef4444",
            }}
          />
          <Text style={{ fontSize: 12, color: colors.text }}>Absent</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: "#f59e0b",
            }}
          />
          <Text style={{ fontSize: 12, color: colors.text }}>Half Day</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: "#06b6d4",
            }}
          />
          <Text style={{ fontSize: 12, color: colors.text }}>On Leave</Text>
        </View>
      </View>
    </View>
  );
};
