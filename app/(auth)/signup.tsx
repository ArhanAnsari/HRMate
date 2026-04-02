import { Input } from "@/src/components/ui/input";
import { Logo } from "@/src/components/ui/Logo";
import { PasswordField } from "@/src/components/ui/PasswordField";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { databases } from "@/src/services/appwrite";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { ID } from "appwrite";
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

  const errorStyle: TextStyle = {
    color: THEME.colors.danger,
    fontSize: 13,
    marginBottom: THEME.spacing.md,
    backgroundColor: THEME.colors.dangerLight,
    padding: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.sm,
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
      // 1. Appwrite Auth Signup (also handles auth login)
      await signup(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.name.trim(),
        formData.companyName.trim(),
      );

      const { user } = useAuthStore.getState();

      if (user) {
        // 2. Generate a unique companyId
        const newCompanyId = ID.unique();

        // 3. Store the newly registered user with companyId in the users_collection
        try {
          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            DB_IDS.USERS,
            user.$id,
            {
              email: user.email,
              full_name: user.name,
              role: "admin", // Provide default role if none
              company_id: newCompanyId,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          );
        } catch (dbError) {
          console.warn(
            "Note: User may have already been saved by auth service, or there was an error.",
            dbError,
          );
        }
      }

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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Decorative hero section */}
          <Animated.View
            entering={FadeInUp.duration(500)}
            style={{
              backgroundColor: THEME.colors.primary,
              paddingTop: THEME.spacing.xl,
              paddingBottom: THEME.spacing["3xl"],
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                alignSelf: "flex-start",
                marginLeft: THEME.spacing.md,
                marginBottom: THEME.spacing.md,
                padding: THEME.spacing.xs,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Logo size="md" containerStyle={{ marginBottom: THEME.spacing.md }} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#FFFFFF",
                marginBottom: THEME.spacing.xs,
              }}
            >
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              Get started with HRMate today
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
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <Input
                label="Company Name"
                placeholder="Acme Inc."
                value={formData.companyName}
                onChangeText={(text) => updateField("companyName", text)}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <PasswordField
                label="Password"
                placeholder="Min. 8 characters"
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(450).springify()}>
              <PasswordField
                label="Confirm Password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField("confirmPassword", text)}
                editable={!isLoading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <PrimaryButton
                label={isLoading ? "Creating Account..." : "Sign Up"}
                onPress={handleSignup}
                disabled={isLoading}
                loading={isLoading}
                size="lg"
                style={{
                  marginBottom: THEME.spacing.lg,
                  marginTop: THEME.spacing.sm,
                }}
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
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={linkStyle}>Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
