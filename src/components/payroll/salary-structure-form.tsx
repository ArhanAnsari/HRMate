import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";
import { SalaryStructure } from "../../types";

interface SalaryStructureFormProps {
  onSubmit: (data: SalaryStructure) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: SalaryStructure;
}

export const SalaryStructureForm: React.FC<SalaryStructureFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialData,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [form, setForm] = useState<SalaryStructure>({
    basic: initialData?.basic || 0,
    hra: initialData?.hra || 0,
    dearness: initialData?.dearness || 0,
    conveyance: initialData?.conveyance || 0,
    other_allowances: initialData?.other_allowances || 0,
    pf: initialData?.pf || 0,
    professionalTax: initialData?.professionalTax || 0,
    incomeTax: initialData?.incomeTax || 0,
    otherDeductions: initialData?.otherDeductions || 0,
  });

  const calculateTotals = () => {
    const allowances =
      (form.hra || 0) +
      (form.dearness || 0) +
      (form.conveyance || 0) +
      (form.other_allowances || 0);
    const deductions =
      (form.pf || 0) +
      (form.professionalTax || 0) +
      (form.incomeTax || 0) +
      (form.otherDeductions || 0);
    const grossSalary = (form.basic || 0) + allowances;
    const netSalary = grossSalary - deductions;

    return { allowances, deductions, grossSalary, netSalary };
  };

  const { allowances, deductions, grossSalary, netSalary } = calculateTotals();

  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder = "0",
    keyboardType = "decimal-pad",
  }: any) => (
    <View style={{ marginBottom: Spacing.md }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: isDark ? "#1f1f1f" : "#f3f4f6",
          borderWidth: 1,
          borderColor: isDark ? "#333" : "#e5e7eb",
          borderRadius: 8,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          color: colors.text,
          fontSize: 14,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value.toString()}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={!isLoading}
      />
    </View>
  );

  const SalarySection = ({
    title,
    fields,
  }: {
    title: string;
    fields: string[];
  }) => (
    <View
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
        borderRadius: 12,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: colors.text,
          marginBottom: Spacing.md,
        }}
      >
        {title}
      </Text>
      {fields.map((field) => (
        <FormInput
          key={field}
          label={
            field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")
          }
          value={form[field as keyof SalaryStructure] || 0}
          onChangeText={(text: string) =>
            setForm({ ...form, [field]: parseFloat(text) || 0 })
          }
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Earnings */}
        <SalarySection
          title="💰 Earnings"
          fields={[
            "basic",
            "hra",
            "dearness",
            "conveyance",
            "other_allowances",
          ]}
        />

        {/* Deductions */}
        <SalarySection
          title="📊 Deductions"
          fields={["pf", "professionalTax", "incomeTax", "otherDeductions"]}
        />

        {/* Summary */}
        <View
          style={{
            backgroundColor: isDark ? "#1f1f1f" : "#f9fafb",
            borderRadius: 12,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: "#3b82f6",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: colors.text,
              marginBottom: Spacing.md,
            }}
          >
            💡 Summary
          </Text>

          <View style={{ gap: Spacing.md }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Basic Salary
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: colors.text }}
              >
                ₹{form.basic || 0}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Total Allowances
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#10b981" }}
              >
                +₹{allowances}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Gross Salary
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: colors.text }}
              >
                ₹{grossSalary.toFixed(2)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? "#333" : "#e5e7eb",
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                Total Deductions
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#ef4444" }}
              >
                -₹{deductions}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: colors.text }}
              >
                Net Salary
              </Text>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#10b981" }}
              >
                ₹{netSalary.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: Spacing.md,
            marginBottom: Spacing.lg,
          }}
        >
          <TouchableOpacity
            disabled={isLoading}
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: isDark ? "#2a2a2a" : "#e5e7eb",
              paddingVertical: Spacing.md,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text
                style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}
              >
                Cancel
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isLoading}
            onPress={() => onSubmit(form)}
            style={{
              flex: 1,
              backgroundColor: "#10b981",
              paddingVertical: Spacing.md,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Save Structure
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
