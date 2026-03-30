import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";
import { Employee } from "../../types";
import { EmployeeCard } from "./employee-card";

interface EmployeeListProps {
  employees: Employee[];
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  onAdd?: () => void;
  onBulkImport?: () => void;
}

const DEPARTMENTS = [
  "HR",
  "IT",
  "Sales",
  "Marketing",
  "Operations",
  "Finance",
  "Engineering",
];
const STATUSES = ["active", "inactive", "on_leave", "terminated"];

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  isLoading,
  onSearch,
  onFilter,
  onEdit,
  onDelete,
  onAdd,
  onBulkImport,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handleFilterChange = () => {
    onFilter?.({
      department: selectedDepartment,
      status: selectedStatus,
    });
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedDepartment, selectedStatus]);

  return (
    <View style={{ flex: 1 }}>
      {/* Search Bar */}
      <View
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          marginBottom: Spacing.md,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search employees..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          style={{
            flex: 1,
            paddingVertical: Spacing.sm,
            color: colors.text,
            fontSize: 14,
          }}
        />
      </View>

      {/* Filter Controls */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: Spacing.md,
          gap: Spacing.sm,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={{
            flex: 1,
            backgroundColor: isDark ? "#2a2a2a" : "#e5e7eb",
            paddingVertical: 10,
            paddingHorizontal: Spacing.md,
            borderRadius: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: colors.text, marginRight: 8 }}>
            ⚙️
          </Text>
          <Text style={{ fontSize: 14, color: colors.text, fontWeight: "500" }}>
            {showFilters ? "Hide" : "Show"} Filters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onBulkImport}
          style={{
            backgroundColor: "#8b5cf6",
            paddingVertical: 10,
            paddingHorizontal: Spacing.md,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff", fontWeight: "600" }}>
            📥
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAdd}
          style={{
            backgroundColor: "#10b981",
            paddingVertical: 10,
            paddingHorizontal: Spacing.md,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 14, color: "#fff", fontWeight: "600" }}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {showFilters && (
        <View
          style={{
            backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
            borderRadius: 12,
            padding: Spacing.md,
            marginBottom: Spacing.md,
            borderWidth: 1,
            borderColor: isDark ? "#333" : "#e5e7eb",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Department
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: Spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={() => setSelectedDepartment(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor:
                  selectedDepartment === null
                    ? "#3b82f6"
                    : isDark
                      ? "#2a2a2a"
                      : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: selectedDepartment === null ? "#fff" : colors.text,
                }}
              >
                All
              </Text>
            </TouchableOpacity>
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                onPress={() => setSelectedDepartment(dept)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    selectedDepartment === dept
                      ? "#3b82f6"
                      : isDark
                        ? "#2a2a2a"
                        : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedDepartment === dept ? "#fff" : colors.text,
                  }}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Status
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedStatus(null)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor:
                  selectedStatus === null
                    ? "#3b82f6"
                    : isDark
                      ? "#2a2a2a"
                      : "#e5e7eb",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: selectedStatus === null ? "#fff" : colors.text,
                }}
              >
                All
              </Text>
            </TouchableOpacity>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor:
                    selectedStatus === status
                      ? "#3b82f6"
                      : isDark
                        ? "#2a2a2a"
                        : "#e5e7eb",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedStatus === status ? "#fff" : colors.text,
                    textTransform: "capitalize",
                  }}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Employee List */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : employees.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            No employees found
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.$id}
              employee={employee}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          <View style={{ height: Spacing.lg }} />
        </ScrollView>
      )}
    </View>
  );
};
