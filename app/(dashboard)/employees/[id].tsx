import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { THEME } from "../../../src/theme";
import { EmployeeUpdateInput } from "../../../src/types";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    selectedEmployee,
    fetchEmployee,
    updateEmployee,
    deleteEmployee,
    isLoading,
  } = useEmployeeStore();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchEmployee(id);
    }
  }, [id, fetchEmployee]);

  const handleUpdate = async (formData: any) => {
    if (!selectedEmployee) return;

    try {
      await updateEmployee(
        selectedEmployee.$id,
        formData as EmployeeUpdateInput,
      );
      showToast("Employee updated successfully!", "success");
      router.back();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to update employee",
        "error",
      );
    }
  };

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "on_leave",
  ) => {
    if (!selectedEmployee) return;
    try {
      await updateEmployee(selectedEmployee.$id, { status: newStatus } as any);
      showToast(`Employee marked as ${newStatus}`, "success");
      fetchEmployee(selectedEmployee.$id); // Refresh
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to change status",
        "error",
      );
    }
  };

  const handleDelete = () => {
    if (!selectedEmployee) return;
    Alert.alert(
      "Delete Employee",
      `Are you sure you want to delete ${selectedEmployee.firstName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmployee(selectedEmployee.$id);
              showToast("Employee deleted successfully", "success");
              router.back();
            } catch (error) {
              showToast(
                error instanceof Error
                  ? error.message
                  : "Failed to delete employee",
                "error",
              );
            }
          },
        },
      ],
    );
  };

  if (isLoading && !selectedEmployee) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: isDark
            ? THEME.dark.background.main
            : THEME.light.background.main,
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark
          ? THEME.dark.background.main
          : THEME.light.background.main,
      }}
    >
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: THEME.spacing.lg,
            paddingBottom: THEME.spacing.md,
            paddingTop: THEME.spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: THEME.spacing.md }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={
                isDark ? THEME.dark.text.primary : THEME.light.text.primary
              }
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            ✏️ Edit Employee
          </Text>
          {selectedEmployee && (
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginTop: 4,
              }}
            >
              {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Text>
          )}
        </View>

        {/* Form & Actions */}
        {selectedEmployee && (
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: THEME.spacing.lg,
              paddingBottom: THEME.spacing.xl,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: THEME.spacing.md,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                {["active", "inactive", "on_leave"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatusChange(s as any)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor:
                        selectedEmployee.status === s
                          ? THEME.colors.primary
                          : THEME.colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedEmployee.status === s
                            ? "white"
                            : isDark
                              ? THEME.dark.text.primary
                              : THEME.light.text.primary,
                        fontSize: 12,
                        fontWeight: "bold",
                        textTransform: "capitalize",
                      }}
                    >
                      {s.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: THEME.colors.danger,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>

            <EmployeeForm
              initialEmployee={selectedEmployee}
              onSubmit={handleUpdate}
              onCancel={() => router.back()}
              isLoading={isLoading}
              companyId={user?.companyId || ""}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
