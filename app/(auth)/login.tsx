import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { THEME } from "@/src/theme";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Mock authentication - replace with actual API call
      if (email && password.length >= 6) {
        await SecureStore.setItemAsync("authToken", "mock-token-" + Date.now());
        router.replace("/(dashboard)");
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
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
          <Text style={titleStyle}>Welcome Back</Text>
          <Text style={subtitleStyle}>Enter your credentials to continue</Text>

          {error ? <Text style={errorStyle}>{error}</Text> : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={inputStyle}
            editable={!loading}
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
            editable={!loading}
          />

          <PrimaryButton
            label={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            loading={loading}
            style={{ marginBottom: THEME.spacing.md }}
          />

          <TouchableOpacity
            style={{ alignItems: "center", marginBottom: THEME.spacing.lg }}
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
              Don't have an account?
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
