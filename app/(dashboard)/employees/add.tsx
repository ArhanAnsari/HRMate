import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { useColorScheme } from "../../../hooks/use-color-scheme";
import { EmployeeForm } from "../../../src/components/employees/employee-form";
import { useAuthStore } from "../../../src/state/auth.store";
import { useEmployeeStore } from "../../../src/state/employee.store";
import { useUIStore } from "../../../src/state/ui.store";
import { THEME } from "../../../src/theme";
import { EmployeeCreateInput } from "../../../src/types";

// Progress Step Indicator Setup
const STEPS = [
  { id: 1, label: "Personal", icon: "account-outline" },
  { id: 2, label: "Job", icon: "briefcase-outline" },
  { id: 3, label: "Financials", icon: "bank-outline" }
];

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  const { user } = useAuthStore();
  const { createEmployee, isLoading } = useEmployeeStore();
  const { showToast } = useUIStore();
  
  // Tracking current step index for multi-step configuration
  const [currentStep, setCurrentStep] = useState(1);

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

  const themeStyles = isDark ? THEME.dark : THEME.light;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: themeStyles.background.main,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header Section */}
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            flexDirection: "row",
            alignItems: "center",
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
              marginRight: THEME.spacing.md,
              padding: THEME.spacing.xs,
              borderRadius: THEME.borderRadius.full,
              backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={themeStyles.text.primary}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: THEME.typography.h4.fontSize,
                fontWeight: THEME.typography.h4.fontWeight,
                color: themeStyles.text.primary,
              }}
            >
              Add New Employee
            </Text>
            <Text style={{ fontSize: THEME.typography.bodyXs.fontSize, color: themeStyles.text.secondary }}>
              Set up workspace profile and records
            </Text>
          </View>
        </Animated.View>

        {/* Step Indicator Module */}
        <View 
          style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            paddingHorizontal: THEME.spacing.xl, 
            paddingVertical: THEME.spacing.md,
            backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
          }}
        >
          {STEPS.map((step, index) => {
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            return (
              <View key={step.id} style={{ flex: index !== STEPS.length - 1 ? 1 : undefined, flexDirection: "row", alignItems: "center" }}>
                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isCurrent 
                        ? THEME.colors.primary 
                        : isActive ? THEME.colors.success : (isDark ? THEME.colors.dark.backgroundTertiary : THEME.colors.border),
                      justifyContent: "center",
                      alignItems: "center",
                      ...THEME.shadows.xs
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={step.icon as any} 
                      size={18} 
                      color={isActive || isCurrent ? "#FFFFFF" : themeStyles.text.tertiary} 
                    />
                  </View>
                  <Text 
                    style={{ 
                      fontSize: 11, 
                      marginTop: 4, 
                      fontWeight: isCurrent ? "600" : "400",
                      color: isCurrent ? THEME.colors.primary : themeStyles.text.secondary 
                    }}
                  >
                    {step.label}
                  </Text>
                </View>
                {index !== STEPS.length - 1 && (
                  <View 
                    style={{ 
                      flex: 1, 
                      height: 2, 
                      backgroundColor: currentStep > step.id ? THEME.colors.success : (isDark ? THEME.colors.dark.border : THEME.colors.border),
                      marginHorizontal: THEME.spacing.xs,
                      marginBottom: THEME.spacing.sm
                    }} 
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Dynamic Form Content */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: THEME.spacing.lg, paddingTop: THEME.spacing.md }}
        >
          <Animated.View entering={FadeInRight.duration(200)}>
            <EmployeeForm
              onSubmit={handleCreate}
              onCancel={() => router.back()}
              isLoading={isLoading}
              companyId={user?.companyId || ""}
              // Passing wizard step helpers down into component
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}