/**
 * 👤 PROFILE SCREEN - User Profile
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  const profileHeaderStyle: ViewStyle = {
    alignItems: "center",
    marginBottom: THEME.spacing.lg,
    paddingVertical: THEME.spacing.lg,
  };

  const avatarStyle: ViewStyle = {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: isDark ? THEME.dark.primary : THEME.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: THEME.spacing.md,
  };

  const nameStyle: TextStyle = {
    fontSize: 24,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.xs,
  };

  const roleStyle: TextStyle = {
    fontSize: 14,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={profileHeaderStyle}>
          <View style={avatarStyle}>
            <MaterialCommunityIcons name="account" size={48} color="white" />
          </View>
          <Text style={nameStyle}>John Doe</Text>
          <Text style={roleStyle}>Senior Manager</Text>
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
            marginBottom: THEME.spacing.md,
          }}
        >
          Information
        </Text>

        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View style={{ marginBottom: THEME.spacing.md }}>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Email
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              john.doe@company.com
            </Text>
          </View>
          <View style={{ marginBottom: THEME.spacing.md }}>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Phone
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              +1 (555) 123-4567
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Department
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              Operations
            </Text>
          </View>
        </PremiumCard>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
            marginBottom: THEME.spacing.md,
          }}
        >
          Employment Details
        </Text>

        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View style={{ marginBottom: THEME.spacing.md }}>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Join Date
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              January 15, 2022
            </Text>
          </View>
          <View style={{ marginBottom: THEME.spacing.md }}>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Employee ID
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              EMP-2022-001
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              Status
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: THEME.spacing.sm,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isDark
                    ? THEME.dark.success
                    : THEME.light.success,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: THEME.colors.success,
                  fontWeight: "600",
                }}
              >
                Active
              </Text>
            </View>
          </View>
        </PremiumCard>

        <PrimaryButton
          label="Edit Profile"
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Edit Profile will be available in the next update.",
            );
          }}
          style={{ marginBottom: THEME.spacing.md }}
        />
        <PrimaryButton
          label="Change Password"
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Change Password will be available in the next update.",
            );
          }}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
