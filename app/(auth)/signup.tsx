import { Logo } from "@/src/components/ui/Logo";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    useColorScheme,
    View,
    ViewStyle,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    password: "",
    confirmPassword: "",
  });
  const [localError, setLocalError] = useState("");
  const { signup, isLoading, error } = useAuthStore();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.lg,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 14,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    marginBottom: THEME.spacing.lg,
  };

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: isDark ? THEME.dark.border : THEME.light.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.md,
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
    fontSize: 16,
  };

  const errorStyle: TextStyle = {
    color: THEME.colors.danger,
    fontSize: 13,
    marginBottom: THEME.spacing.md,
  };

  const linkStyle: TextStyle = {
    color: THEME.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  };

  const handleSignup = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.companyName
    ) {
      setLocalError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    setLocalError("");

    try {
      await signup(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.name.trim(),
        formData.companyName.trim(),
      );
      // Navigation handled by _layout.tsx auth guard
    } catch {
      // Error already set in auth store
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: THEME.spacing.md }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                isDark ? THEME.dark.text.primary : THEME.light.text.primary
              }
            />
          </TouchableOpacity>

          <Logo size="md" containerStyle={{ marginBottom: THEME.spacing.md }} />

          <Text style={titleStyle}>Create Account</Text>
          <Text style={subtitleStyle}>Get started with HRMate today</Text>

          {displayError ? <Text style={errorStyle}>{displayError}</Text> : null}

          <TextInput
            placeholder="Full Name"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={formData.name}
            onChangeText={(text) => updateField("name", text)}
            style={inputStyle}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Email"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={formData.email}
            onChangeText={(text) => updateField("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Company Name"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={formData.companyName}
            onChangeText={(text) => updateField("companyName", text)}
            style={inputStyle}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Password (min 8 characters)"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={formData.password}
            onChangeText={(text) => updateField("password", text)}
            secureTextEntry
            style={inputStyle}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={formData.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            secureTextEntry
            style={inputStyle}
            editable={!isLoading}
          />

          <PrimaryButton
            label={isLoading ? "Creating Account..." : "Sign Up"}
            onPress={handleSignup}
            disabled={isLoading}
            loading={isLoading}
            style={{
              marginBottom: THEME.spacing.lg,
              marginTop: THEME.spacing.md,
            }}
          />

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginBottom: THEME.spacing.sm,
              }}
            >
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={linkStyle}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
