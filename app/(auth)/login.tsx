import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
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

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, isLoading, error } = useAuthStore();

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
    fontSize: 32,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 16,
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

  const linkStyle: TextStyle = {
    color: THEME.colors.primary,
    fontWeight: "600",
    fontSize: 14,
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError("Please enter email and password");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }

    setLocalError("");

    try {
      await login(email.trim().toLowerCase(), password);
      // Navigation handled by _layout.tsx auth guard
    } catch {
      // Error already set in auth store
    }
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
          <Text style={titleStyle}>Welcome Back</Text>
          <Text style={subtitleStyle}>Enter your credentials to continue</Text>

          {displayError ? (
            <Text style={errorStyle}>{displayError}</Text>
          ) : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={inputStyle}
            editable={!isLoading}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={inputStyle}
            editable={!isLoading}
          />

          <PrimaryButton
            label={isLoading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={isLoading}
            loading={isLoading}
            style={{ marginBottom: THEME.spacing.md }}
          />

          <TouchableOpacity
            style={{ alignItems: "center", marginBottom: THEME.spacing.lg }}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text style={linkStyle}>Forgot Password?</Text>
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
              paddingTop: THEME.spacing.lg,
              borderTopWidth: 1,
              borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
            }}
          >
            <Text
              style={{
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginBottom: THEME.spacing.sm,
              }}
            >
              Don&apos;t have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={linkStyle}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
