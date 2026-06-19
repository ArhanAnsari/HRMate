import { SecurityService } from "@/src/services/security/SecurityService";
import { THEME } from "@/src/theme";
import React, { useState, Dispatch, SetStateAction } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Employee, EmployeeCreateInput } from "../../types";

interface EmployeeFormProps {
  initialEmployee?: Employee;
  onSubmit: (data: EmployeeCreateInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  companyId: string;
  currentStep: number;
  onStepChange: Dispatch<SetStateAction<number>> | ((step: number) => void);
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
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "temporary"];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialEmployee,
  onSubmit,
  onCancel,
  isLoading = false,
  companyId,
  currentStep,
  onStepChange,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // State containing all possible properties from EmployeeCreateInput
  const [form, setForm] = useState<EmployeeCreateInput>({
    firstName: initialEmployee?.firstName || "",
    lastName: initialEmployee?.lastName || "",
    email: initialEmployee?.email || "",
    phone: initialEmployee?.phone || "",
    position: initialEmployee?.position || "",
    department: initialEmployee?.department || DEPARTMENTS[0],
    joiningDate: initialEmployee?.joiningDate || new Date().toISOString().split("T")[0],
    dateOfBirth: initialEmployee?.dateOfBirth || "",
    employmentType: initialEmployee?.employmentType ?? "full_time",
    baseSalary: initialEmployee?.baseSalary || undefined,
    panNumber: initialEmployee?.panNumber || "",
    aadharNumber: initialEmployee?.aadharNumber || "",
    bankDetails: {
      accountName: initialEmployee?.bankDetails?.accountName || "",
      accountNumber: initialEmployee?.bankDetails?.accountNumber || "",
      bankName: initialEmployee?.bankDetails?.bankName || "",
      ifscCode: initialEmployee?.bankDetails?.ifscCode || "",
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validates current step data before letting user move forward
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!form.firstName.trim()) newErrors.firstName = "First name is required";
      if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!SecurityService.validateEmail(form.email))
        newErrors.email = "Invalid email format";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (currentStep === 2) {
      if (!form.position.trim()) newErrors.position = "Position is required";
      if (!form.joiningDate.trim()) newErrors.joiningDate = "Joining date is required";
    }

    if (currentStep === 3) {
      if (form.bankDetails?.accountNumber && !form.bankDetails.bankName.trim()) {
        newErrors.bankName = "Bank Name is required if bank details are provided";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onStepChange(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      await onSubmit({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        position: form.position.trim(),
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save employee",
      );
    }
  };

  const FormInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    error,
  }: any) => (
    <View style={{ marginBottom: THEME.spacing.md }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: isDark ? THEME.dark.background.tertiary : THEME.light.background.tertiary,
          borderWidth: 1,
          borderColor: error ? "#ef4444" : isDark ? THEME.dark.border : THEME.light.border,
          borderRadius: THEME.borderRadius.md,
          paddingHorizontal: THEME.spacing.md,
          paddingVertical: THEME.spacing.sm,
          color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
          fontSize: 14,
        }}
        placeholder={placeholder}
        placeholderTextColor={isDark ? THEME.dark.text.secondary : THEME.light.text.secondary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        editable={!isLoading}
      />
      {error && (
        <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );

  const FormSelect = ({ label, value, onChangeText, options }: any) => (
    <View style={{ marginBottom: THEME.spacing.md }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
        {options.map((option: string) => (
          <TouchableOpacity
            key={option}
            disabled={isLoading}
            onPress={() => onChangeText(option)}
            style={{
              paddingHorizontal: THEME.spacing.md,
              paddingVertical: THEME.spacing.sm,
              borderRadius: THEME.borderRadius.md,
              marginRight: THEME.spacing.sm,
              backgroundColor: value === option ? THEME.colors.primary : isDark ? THEME.dark.background.tertiary : THEME.light.background.tertiary,
              borderWidth: 1,
              borderColor: value === option ? THEME.colors.primary : isDark ? THEME.dark.border : THEME.light.border,
            }}
          >
            <Text
              style={{
                color: value === option ? "#fff" : isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                fontWeight: value === option ? "600" : "400",
                fontSize: 13,
                textTransform: option.includes("_") ? "capitalize" : "none"
              }}
            >
              {option.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* STEP 1: PERSONAL INFORMATION */}
      {currentStep === 1 && (
        <View>
          <FormInput
            label="First Name *"
            value={form.firstName}
            onChangeText={(text: string) => setForm({ ...form, firstName: text })}
            placeholder="John"
            error={errors.firstName}
          />
          <FormInput
            label="Last Name *"
            value={form.lastName}
            onChangeText={(text: string) => setForm({ ...form, lastName: text })}
            placeholder="Doe"
            error={errors.lastName}
          />
          <FormInput
            label="Email Address *"
            value={form.email}
            onChangeText={(text: string) => setForm({ ...form, email: text })}
            placeholder="john.doe@company.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <FormInput
            label="Phone Number *"
            value={form.phone}
            onChangeText={(text: string) => setForm({ ...form, phone: text })}
            placeholder="+1 (555) 019-2834"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <FormInput
            label="Date of Birth"
            value={form.dateOfBirth}
            onChangeText={(text: string) => setForm({ ...form, dateOfBirth: text })}
            placeholder="1995-08-24"
          />
        </View>
      )}

      {/* STEP 2: JOB PROFILE */}
      {currentStep === 2 && (
        <View>
          <FormInput
            label="Designation / Position *"
            value={form.position}
            onChangeText={(text: string) => setForm({ ...form, position: text })}
            placeholder="Software Engineer"
            error={errors.position}
          />
          <FormSelect
            label="Department"
            value={form.department}
            onChangeText={(text: string) => setForm({ ...form, department: text })}
            options={DEPARTMENTS}
          />
          <FormSelect
            label="Employment Type"
            value={form.employmentType}
            onChangeText={(text: string) => setForm({ ...form, employmentType: text })}
            options={EMPLOYMENT_TYPES}
          />
          <FormInput
            label="Joining Date (YYYY-MM-DD) *"
            value={form.joiningDate}
            onChangeText={(text: string) => setForm({ ...form, joiningDate: text })}
            placeholder="2026-06-01"
            error={errors.joiningDate}
          />
        </View>
      )}

      {/* STEP 3: FINANCIALS & DOCUMENTS */}
      {currentStep === 3 && (
        <View>
          <FormInput
            label="Base Annual Salary"
            value={form.baseSalary ? form.baseSalary.toString() : ""}
            onChangeText={(text: string) => setForm({ ...form, baseSalary: text ? Number(text) : undefined })}
            placeholder="85000"
            keyboardType="numeric"
          />
          <FormInput
            label="PAN Identification Number"
            value={form.panNumber}
            onChangeText={(text: string) => setForm({ ...form, panNumber: text.toUpperCase() })}
            placeholder="ABCDE1234F"
          />
          <FormInput
            label="Aadhar Identity Number"
            value={form.aadharNumber}
            onChangeText={(text: string) => setForm({ ...form, aadharNumber: text })}
            placeholder="0000 1111 2222"
            keyboardType="numeric"
          />
          
          <Text style={{ fontSize: 14, fontWeight: "700", color: THEME.colors.primary, marginTop: THEME.spacing.sm, marginBottom: THEME.spacing.xs }}>
            Bank Account Details
          </Text>
          
          <FormInput
            label="Bank Name"
            value={form.bankDetails?.bankName}
            onChangeText={(text: string) => setForm({ ...form, bankDetails: { ...form.bankDetails!, bankName: text } })}
            placeholder="Chase Bank"
            error={errors.bankName}
          />
          <FormInput
            label="Account Holder Name"
            value={form.bankDetails?.accountName}
            onChangeText={(text: string) => setForm({ ...form, bankDetails: { ...form.bankDetails!, accountName: text } })}
            placeholder="John Doe"
          />
          <FormInput
            label="Account Number"
            value={form.bankDetails?.accountNumber}
            onChangeText={(text: string) => setForm({ ...form, bankDetails: { ...form.bankDetails!, accountNumber: text } })}
            placeholder="1234567890"
            keyboardType="numeric"
          />
          <FormInput
            label="Routing / IFSC Code"
            value={form.bankDetails?.ifscCode}
            onChangeText={(text: string) => setForm({ ...form, bankDetails: { ...form.bankDetails!, ifscCode: text.toUpperCase() } })}
            placeholder="CHAS0000123"
          />
        </View>
      )}

      {/* FOOTER WIZARD NAVIGATION SYSTEM */}
      <View
        style={{
          flexDirection: "row",
          gap: THEME.spacing.md,
          marginTop: THEME.spacing.lg,
        }}
      >
        {currentStep > 1 ? (
          <TouchableOpacity
            disabled={isLoading}
            onPress={() => onStepChange(currentStep - 1)}
            style={{
              flex: 1,
              backgroundColor: isDark ? THEME.dark.background.tertiary : THEME.light.background.tertiary,
              paddingVertical: THEME.spacing.md,
              borderRadius: THEME.borderRadius.md,
              alignItems: "center",
              borderWidth: 1,
              borderColor: isDark ? THEME.dark.border : THEME.light.border,
            }}
          >
            <Text style={{ color: isDark ? THEME.dark.text.primary : THEME.light.text.primary, fontWeight: "600", fontSize: 14 }}>
              Back
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={isLoading}
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: isDark ? THEME.dark.background.tertiary : THEME.light.background.tertiary,
              paddingVertical: THEME.spacing.md,
              borderRadius: THEME.borderRadius.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: isDark ? THEME.dark.text.primary : THEME.light.text.primary, fontWeight: "600", fontSize: 14 }}>
              Cancel
            </Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,
              backgroundColor: THEME.colors.primary,
              paddingVertical: THEME.spacing.md,
              borderRadius: THEME.borderRadius.md,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              Next Step
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={isLoading}
            onPress={handleSubmit}
            style={{
              flex: 1,
              backgroundColor: THEME.colors.success,
              paddingVertical: THEME.spacing.md,
              borderRadius: THEME.borderRadius.md,
              alignItems: "center",
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                {initialEmployee ? "Update" : "Create"} Employee
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
