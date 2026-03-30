import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
import { Employee, EmployeeCreateInput } from "../../types";

interface EmployeeFormProps {
  initialEmployee?: Employee;
  onSubmit: (data: EmployeeCreateInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
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
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const [form, setForm] = useState<EmployeeCreateInput>({
    firstName: initialEmployee?.firstName || "",
    lastName: initialEmployee?.lastName || "",
    email: initialEmployee?.email || "",
    phone: initialEmployee?.phone || "",
    position: initialEmployee?.position || "",
    department: initialEmployee?.department || DEPARTMENTS[0],
    joiningDate:
      initialEmployee?.joiningDate || new Date().toISOString().split("T")[0],
    dateOfBirth: initialEmployee?.dateOfBirth || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.position.trim()) newErrors.position = "Position is required";
    if (!form.joiningDate) newErrors.joiningDate = "Joining date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(form);
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
    <View style={{ marginBottom: Spacing.md }}>
      <Text
        style={{
          fontSize: 13,
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
          borderColor: error ? "#ef4444" : isDark ? "#333" : "#e5e7eb",
          borderRadius: 8,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          color: colors.text,
          fontSize: 14,
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
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

  const FormSelect = ({ label, value, onChangeText, options, error }: any) => (
    <View style={{ marginBottom: Spacing.md }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          flexDirection: "row",
        }}
      >
        {options.map((option: string) => (
          <TouchableOpacity
            key={option}
            disabled={isLoading}
            onPress={() => onChangeText(option)}
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: 8,
              marginRight: Spacing.sm,
              backgroundColor:
                value === option ? "#3b82f6" : isDark ? "#1f1f1f" : "#f3f4f6",
              borderWidth: 1,
              borderColor:
                value === option ? "#3b82f6" : isDark ? "#333" : "#e5e7eb",
            }}
          >
            <Text
              style={{
                color: value === option ? "#fff" : colors.text,
                fontWeight: value === option ? "600" : "400",
                fontSize: 13,
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {error && (
        <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <FormInput
          label="First Name"
          value={form.firstName}
          onChangeText={(text: string) => setForm({ ...form, firstName: text })}
          placeholder="John"
          error={errors.firstName}
        />

        <FormInput
          label="Last Name"
          value={form.lastName}
          onChangeText={(text: string) => setForm({ ...form, lastName: text })}
          placeholder="Doe"
          error={errors.lastName}
        />

        <FormInput
          label="Email"
          value={form.email}
          onChangeText={(text: string) => setForm({ ...form, email: text })}
          placeholder="john@example.com"
          keyboardType="email-address"
          error={errors.email}
        />

        <FormInput
          label="Phone"
          value={form.phone}
          onChangeText={(text: string) => setForm({ ...form, phone: text })}
          placeholder="+1 (555) 000-0000"
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <FormInput
          label="Position"
          value={form.position}
          onChangeText={(text: string) => setForm({ ...form, position: text })}
          placeholder="e.g., Senior Developer"
          error={errors.position}
        />

        <FormSelect
          label="Department"
          value={form.department}
          onChangeText={(text: string) =>
            setForm({ ...form, department: text })
          }
          options={DEPARTMENTS}
        />

        <FormSelect
          label="Employment Type"
          value={form.salaryStructure?.basic ? "full_time" : "full_time"}
          onChangeText={() => {}}
          options={EMPLOYMENT_TYPES}
        />

        <FormInput
          label="Joining Date (YYYY-MM-DD)"
          value={form.joiningDate}
          onChangeText={(text: string) =>
            setForm({ ...form, joiningDate: text })
          }
          placeholder="2024-01-15"
          error={errors.joiningDate}
        />

        <FormInput
          label="Date of Birth (YYYY-MM-DD)"
          value={form.dateOfBirth || ""}
          onChangeText={(text: string) =>
            setForm({ ...form, dateOfBirth: text })
          }
          placeholder="1990-05-20"
        />

        <View
          style={{
            flexDirection: "row",
            gap: Spacing.md,
            marginTop: Spacing.lg,
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
            onPress={handleSubmit}
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
                {initialEmployee ? "Update" : "Create"} Employee
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.lg }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
