import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { THEME } from "../../../src/theme";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useAuthStore } from "../../../src/state/auth.store";
import { useUIStore } from "../../../src/state/ui.store";
import { EmployeeUpdateInput } from "../../../src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { selectedEmployee, fetchEmployee, updateEmployee, isLoading } =
    useEmployeeStore();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchEmployee(id);
    }
  }, [id]);

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

  if (isLoading && !selectedEmployee) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? THEME.dark.background.main : THEME.light.background.main }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? THEME.dark.background.main : THEME.light.background.main }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: THEME.spacing.lg, paddingBottom: THEME.spacing.md, paddingTop: THEME.spacing.md }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: THEME.spacing.md }}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={isDark ? THEME.dark.text.primary : THEME.light.text.primary}
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary }}>
            ✏️ Edit Employee
          </Text>
          {selectedEmployee && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
                marginTop: 4,
              }}
            >
              {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Text>
          )}
        </View>

        {/* Form */}
        {selectedEmployee && (
          <View style={{ flex: 1, paddingHorizontal: THEME.spacing.lg }}>
            <EmployeeForm
              initialEmployee={selectedEmployee}
              onSubmit={handleUpdate}
              onCancel={() => router.back()}
              isLoading={isLoading}
              companyId={user?.companyId || ""}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}