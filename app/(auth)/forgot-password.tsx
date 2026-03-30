import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { authService } from "@/src/services/auth.service";
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 14,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    marginBottom: THEME.spacing.xl,
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
    marginBottom: THEME.spacing.sm,
  };

  const successStyle: TextStyle = {
    color: THEME.colors.success,
    fontSize: 14,
    marginBottom: THEME.spacing.md,
    lineHeight: 22,
  };

  const linkStyle: TextStyle = {
    color: THEME.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  };

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            style={{ marginBottom: THEME.spacing.lg }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={
                isDark ? THEME.dark.text.primary : THEME.light.text.primary
              }
            />
          </TouchableOpacity>

          <Text style={titleStyle}>Reset Password</Text>
          <Text style={subtitleStyle}>
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </Text>

          {error ? <Text style={errorStyle}>{error}</Text> : null}

          {success ? (
            <View
              style={{
                backgroundColor: THEME.colors.successLight,
                borderRadius: THEME.borderRadius.md,
                padding: THEME.spacing.md,
                marginBottom: THEME.spacing.lg,
              }}
            >
              <Text style={successStyle}>
                ✅ Password reset email sent! Check your inbox and follow the
                instructions to reset your password.
              </Text>
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={linkStyle}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                placeholder="Email address"
                placeholderTextColor={
                  isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
                }
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={inputStyle}
                editable={!loading}
              />

              <PrimaryButton
                label={loading ? "Sending..." : "Send Reset Link"}
                onPress={handleReset}
                disabled={loading}
                loading={loading}
                style={{ marginBottom: THEME.spacing.md }}
              />
            </>
          )}

          <View style={{ alignItems: "center", marginTop: THEME.spacing.md }}>
            <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
              <Text style={linkStyle}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
