import { Input } from "@/src/components/ui/input";
import { Logo } from "@/src/components/ui/Logo";
import { PasswordField } from "@/src/components/ui/PasswordField";
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
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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

  const errorStyle: TextStyle = {
    color: THEME.colors.danger,
    fontSize: 13,
    marginBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Decorative hero section */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={{
              backgroundColor: THEME.colors.primary,
              paddingTop: THEME.spacing.xxl,
              paddingBottom: THEME.spacing["3xl"],
              alignItems: "center",
            }}
          >
            <Logo size="lg" containerStyle={{ marginBottom: THEME.spacing.lg }} />
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: THEME.spacing.xs,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Sign in to your HRMate account
            </Text>
          </Animated.View>

          {/* Form card overlapping hero */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={{
              marginTop: -THEME.spacing.xl,
              marginHorizontal: THEME.spacing.md,
              backgroundColor: isDark
                ? THEME.dark.background.alt
                : THEME.light.background.main,
              borderRadius: THEME.borderRadius.xl,
              padding: THEME.spacing.lg,
              ...THEME.shadows.lg,
              marginBottom: THEME.spacing.xl,
            }}
          >
            {displayError ? (
              <Text style={errorStyle}>{displayError}</Text>
            ) : null}

            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <PasswordField
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(450).springify()}>
              <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: THEME.spacing.lg }}
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <Text style={linkStyle}>Forgot Password?</Text>
              </TouchableOpacity>

              <PrimaryButton
                label={isLoading ? "Logging in..." : "Login"}
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
                size="lg"
                style={{ marginBottom: THEME.spacing.lg }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: THEME.spacing.md,
                  borderTopWidth: 1,
                  borderTopColor: isDark
                    ? THEME.dark.border
                    : THEME.light.border,
                  gap: THEME.spacing.xs,
                }}
              >
                <Text
                  style={{
                    color: isDark
                      ? THEME.dark.text.secondary
                      : THEME.light.text.secondary,
                    fontSize: 14,
                  }}
                >
                  Don&apos;t have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                  <Text style={linkStyle}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
