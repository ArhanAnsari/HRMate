import { Input } from "@/src/components/ui/input";
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
  TextStyle,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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

  const errorStyle: TextStyle = {
    color: THEME.colors.danger,
    fontSize: 13,
    marginBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Decorative hero section */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={{
              backgroundColor: THEME.colors.primary,
              paddingTop: THEME.spacing.xl,
              paddingBottom: THEME.spacing["3xl"],
              paddingHorizontal: THEME.spacing.md,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: THEME.spacing.lg, alignSelf: "flex-start" }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: THEME.spacing.xs,
              }}
            >
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
                lineHeight: 22,
              }}
            >
              Enter your email and we&apos;ll send you a link to reset your
              password.
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
            {error ? <Text style={errorStyle}>{error}</Text> : null}

            {success ? (
              <Animated.View
                entering={FadeInDown.springify()}
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
                <TouchableOpacity
                  onPress={() => router.replace("/(auth)/login")}
                >
                  <Text style={linkStyle}>Back to Login</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  <Input
                    label="Email Address"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={!loading}
                  />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(350).springify()}>
                  <PrimaryButton
                    label={loading ? "Sending..." : "Send Reset Link"}
                    onPress={handleReset}
                    disabled={loading}
                    loading={loading}
                    size="lg"
                    style={{ marginBottom: THEME.spacing.md }}
                  />
                </Animated.View>
              </>
            )}

            <Animated.View
              entering={FadeInDown.delay(450).springify()}
              style={{
                alignItems: "center",
                paddingTop: THEME.spacing.md,
                borderTopWidth: 1,
                borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
                marginTop: THEME.spacing.sm,
              }}
            >
              <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
                <Text style={linkStyle}>← Back to Login</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
