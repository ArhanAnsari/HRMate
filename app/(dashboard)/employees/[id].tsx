import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { Button } from "../../../src/components/ui/button";
import { Container } from "../../../src/components/ui/container";
import { Colors, Spacing } from "../../../src/constants";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { EmployeeUpdateInput } from "../../../src/types";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { selectedEmployee, fetchEmployee, updateEmployee, isLoading } =
    useEmployeeStore();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

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
            ✏️ Edit Employee
          </Text>
          {selectedEmployee && (
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Text>
          )}
        </View>

        {selectedEmployee && (
          <View style={{ flex: 1 }}>
            <EmployeeForm
              initialEmployee={selectedEmployee}
              onSubmit={handleUpdate}
              onCancel={() => router.back()}
              isLoading={isLoading}
            />
          </View>
        )}
      </Container>
    </SafeAreaView>
  );
}
