import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { THEME } from "../../../src/theme";
import { EmployeeUpdateInput } from "../../../src/types";

const STEPS = [
  { id: 1, label: "Personal", icon: "account-outline" },
  { id: 2, label: "Job", icon: "briefcase-outline" },
  { id: 3, label: "Financials", icon: "bank-outline" }
];

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Local state to control active wizard panel tab
  const [currentStep, setCurrentStep] = useState(1);

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
      "Delete Employee Profile",
      `Are you sure you want to permanently delete ${selectedEmployee.firstName}'s files? This action cannot be reversed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Profile",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEmployee(selectedEmployee.$id);
              showToast("Employee record wiped successfully", "success");
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

  const themeStyles = isDark ? THEME.dark : THEME.light;

  if (isLoading && !selectedEmployee) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
      <View style={{ flex: 1 }}>
        
        {/* Header Base Layout */}
        <View
          style={{
            paddingHorizontal: THEME.spacing.lg,
            paddingBottom: THEME.spacing.sm,
            paddingTop: THEME.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: themeStyles.border,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ 
              marginBottom: THEME.spacing.sm,
              alignSelf: 'flex-start',
              padding: THEME.spacing.xs,
              borderRadius: THEME.borderRadius.full,
              backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={themeStyles.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: THEME.typography.h4.fontSize, fontWeight: THEME.typography.h4.fontWeight, color: themeStyles.text.primary }}>
            ✏️ Modify Profile
          </Text>
          {selectedEmployee && (
            <Text style={{ fontSize: THEME.typography.bodySm.fontSize, color: themeStyles.text.secondary, marginTop: 2 }}>
              Managing: {selectedEmployee.firstName} {selectedEmployee.lastName}
            </Text>
          )}
        </View>

        {selectedEmployee && (
          <View style={{ flex: 1 }}>
            
            {/* Quick Status Bar & Actions */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: THEME.spacing.lg,
                paddingVertical: THEME.spacing.sm,
                backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
                borderBottomWidth: 1,
                borderBottomColor: themeStyles.border,
              }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                {["active", "inactive", "on_leave"].map((s) => {
                  const isSelected = selectedEmployee.status === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => handleStatusChange(s as any)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: THEME.borderRadius.md,
                        backgroundColor: isSelected ? THEME.colors.primary : (isDark ? THEME.colors.dark.backgroundTertiary : THEME.colors.border),
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? "white" : themeStyles.text.secondary,
                          fontSize: 11,
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {s.replace("_", " ")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: THEME.borderRadius.md,
                  backgroundColor: THEME.colors.dangerLight,
                }}
              >
                <Text style={{ color: THEME.colors.danger, fontSize: 11, fontWeight: "700" }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quick-Jump Step Clickable Progress Tabs */}
            <View 
              style={{ 
                flexDirection: "row", 
                justifyContent: "space-between", 
                paddingHorizontal: THEME.spacing.xl, 
                paddingVertical: THEME.spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: themeStyles.border
              }}
            >
              {STEPS.map((step, index) => {
                const isCurrent = currentStep === step.id;
                return (
                  <TouchableOpacity 
                    key={step.id} 
                    onPress={() => setCurrentStep(step.id)}
                    style={{ 
                      flexDirection: "row", 
                      alignItems: "center",
                      borderBottomWidth: 2,
                      borderBottomColor: isCurrent ? THEME.colors.primary : 'transparent',
                      paddingBottom: 6,
                      flex: 1,
                      justifyContent: 'center'
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={step.icon as any} 
                      size={16} 
                      color={isCurrent ? THEME.colors.primary : themeStyles.text.tertiary} 
                      style={{ marginRight: 4 }}
                    />
                    <Text style={{ fontSize: 12, fontWeight: isCurrent ? "700" : "400", color: isCurrent ? THEME.colors.primary : themeStyles.text.secondary }}>
                      {step.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Core Form Component container */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: THEME.spacing.lg,
                paddingTop: THEME.spacing.md,
                paddingBottom: THEME.spacing.xl,
              }}
            >
              <EmployeeForm
                initialEmployee={selectedEmployee}
                onSubmit={handleUpdate}
                onCancel={() => router.back()}
                isLoading={isLoading}
                companyId={user?.companyId || ""}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
