import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { THEME } from "../../../src/theme";
import { EmployeeCreateInput } from "../../../src/types";

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { user } = useAuthStore();
  const { createEmployee, isLoading } = useEmployeeStore();
  const { showToast } = useUIStore();

  const handleCreate = async (formData: EmployeeCreateInput) => {
    if (!user?.companyId) {
      showToast("Company ID not found", "error");
      return;
    }

    try {
      await createEmployee(user.companyId, formData);
      showToast("Employee created successfully!", "success");
      router.back();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to create employee",
        "error",
      );
    }
  };

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
            ➕ Add New Employee
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1, paddingHorizontal: THEME.spacing.lg }}>
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => router.back()}
            isLoading={isLoading}
            companyId={user?.companyId || ""}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
