import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";
import { Employee } from "../../types";

interface EmployeeCardProps {
  employee: Employee;
  onPress?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onPress,
  onEdit,
  onDelete,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const handleDelete = () => {
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${employee.firstName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(employee.$id),
        },
      ],
    );
  };

  return (
    <TouchableOpacity
      onPress={() => onPress?.(employee)}
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#fff",
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: isDark ? "#333" : "#eee",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            {employee.firstName} {employee.lastName}
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}
          >
            {employee.position}
          </Text>
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}
          >
            {employee.department}
          </Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: Spacing.sm,
              gap: Spacing.sm,
            }}
          >
            <View
              style={{
                backgroundColor:
                  employee.status === "active"
                    ? "#10b981"
                    : employee.status === "on_leave"
                      ? "#f59e0b"
                      : "#ef4444",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 11, color: "#fff", fontWeight: "500" }}>
                {employee.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: Spacing.sm }}>
          <TouchableOpacity
            onPress={() => onEdit?.(employee)}
            style={{
              padding: 8,
              backgroundColor: "#3b82f6",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              ✎
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              padding: 8,
              backgroundColor: "#ef4444",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: Spacing.sm, gap: 4 }}>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          📧 {employee.email}
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          📱 {employee.phone}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
