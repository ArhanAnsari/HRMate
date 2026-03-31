/**
 * ⚙️ SETTINGS SCREEN - App Preferences
 * Manages notifications, security, profile, and app settings
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import BiometricAuthService from "@/src/services/biometric.service";
import { useAuthStore } from "@/src/state/auth.store";
import { useBiometricStore } from "@/src/state/biometric.store";
import { useNotificationStore } from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { logout } = useAuthStore();
  const { biometricEnabled, setBiometricEnabled, biometricType } =
    useBiometricStore();
  const { notificationsEnabled, toggleNotificationsEnabled } =
    useNotificationStore();
  const [emailReminders, setEmailReminders] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      const available = await BiometricAuthService.isAvailable();
      setBiometricAvailable(available);
    };
    checkBiometric();
  }, []);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 16,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  };

  const renderSetting = (
    label: string,
    value: boolean,
    onToggle: (val: boolean) => void,
  ) => (
    <PremiumCard
      style={{
        marginBottom: THEME.spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "500",
          color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
        }}
      >
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: isDark ? THEME.dark.border : THEME.light.border,
          true: THEME.colors.primary,
        }}
      />
    </PremiumCard>
  );

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await logout();
        },
        style: "destructive",
      },
    ]);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      if (!biometricAvailable) {
        Alert.alert(
          "Not Available",
          "Biometric authentication is not available on this device",
        );
        return;
      }
      const authenticated = await BiometricAuthService.authenticate();
      if (authenticated) {
        setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
      await BiometricAuthService.clearAllBiometricCredentials();
    }
  };

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        <Text style={titleStyle}>Settings</Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark
              ? THEME.dark.text.secondary
              : THEME.light.text.secondary,
            marginBottom: THEME.spacing.lg,
          }}
        >
          Manage app preferences and security
        </Text>

        <Text style={sectionTitleStyle}>Notifications</Text>
        {renderSetting(
          "Push Notifications",
          notificationsEnabled,
          toggleNotificationsEnabled,
        )}
        {renderSetting("Email Reminders", emailReminders, setEmailReminders)}

        <Text style={sectionTitleStyle}>Security</Text>
        {biometricAvailable &&
          renderSetting(
            `${biometricType === "face" ? "Face ID" : "Fingerprint"}`,
            biometricEnabled,
            handleBiometricToggle,
          )}
        <PrimaryButton
          label="Change Password"
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Change Password will be available in the next update.",
            );
          }}
          style={{ marginBottom: THEME.spacing.md }}
        />
        <PrimaryButton
          label="Edit Profile"
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Edit Profile will be available in the next update.",
            );
          }}
          variant="secondary"
          style={{ marginBottom: THEME.spacing.md }}
        />

        <Text style={sectionTitleStyle}>About</Text>
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              HRMate
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
              }}
            >
              Version 1.0.0 • Premium Edition
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginTop: THEME.spacing.sm,
              }}
            >
              © 2026 HRMate. All rights reserved.
            </Text>
          </View>
        </PremiumCard>

        <PrimaryButton label="Logout" onPress={handleLogout} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}
