/**
 * ⚙️ SETTINGS SCREEN - App Preferences
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { THEME } from "@/src/theme";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [biometric, setBiometric] = useState(false);

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
          true: isDark ? THEME.dark.primary : THEME.light.primary,
        }}
      />
    </PremiumCard>
  );

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
          Manage app preferences
        </Text>

        <Text style={sectionTitleStyle}>Notifications</Text>
        {renderSetting("Push Notifications", notifications, setNotifications)}
        {renderSetting("Email Reminders", emailReminders, setEmailReminders)}

        <Text style={sectionTitleStyle}>Security</Text>
        {renderSetting("Biometric Login", biometric, setBiometric)}

        <Text style={sectionTitleStyle}>Profile</Text>
        <PrimaryButton
          label="Change Password"
          onPress={() => {}}
          style={{ marginBottom: THEME.spacing.md }}
        />
        <PrimaryButton
          label="Edit Profile"
          onPress={() => {}}
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
              Version 1.0.0
            </Text>
          </View>
        </PremiumCard>

        <PrimaryButton label="Logout" onPress={() => {}} variant="danger" />
      </ScrollView>
    </SafeAreaView>
  );
}
