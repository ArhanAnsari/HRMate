import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { Button } from "../../../src/components/ui/button";
import { Container } from "../../../src/components/ui/container";
import { Colors, Spacing } from "../../../src/constants";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { EmployeeCreateInput } from "../../../src/types";

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Container padding={Spacing.lg}>
        <View style={{ marginBottom: Spacing.lg }}>
          <Button
            title="← Back"
            onPress={() => router.back()}
            variant="ghost"
            size="sm"
          />
        </View>

        <View style={{ marginBottom: Spacing.lg }}>
          <Text
            style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}
          >
            ➕ Add New Employee
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <EmployeeForm
            onSubmit={handleCreate}
            onCancel={() => router.back()}
            isLoading={isLoading}
          />
        </View>
      </Container>
    </SafeAreaView>
  );
}
