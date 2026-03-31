/**
 * ⚙️ SETTINGS SCREEN - App Preferences
 * Manages notifications, security, profile, and app settings
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import BiometricAuthService from "@/src/services/biometric.service";
import { account } from "@/src/services/appwrite";
import { useAuthStore } from "@/src/state/auth.store";
import { useBiometricStore } from "@/src/state/biometric.store";
import { useNotificationStore } from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { logout, user, checkAuth } = useAuthStore();
  const { biometricEnabled, setBiometricEnabled, biometricType } =
    useBiometricStore();
  const { notificationsEnabled, toggleNotificationsEnabled } =
    useNotificationStore();
  const [emailReminders, setEmailReminders] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Change Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

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

  const modalInputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: isDark ? THEME.dark.border : THEME.light.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    backgroundColor: isDark
      ? THEME.dark.background.tertiary
      : THEME.light.background.tertiary,
    marginBottom: THEME.spacing.md,
    fontSize: 14,
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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to change password. Please check your current password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }
    setProfileLoading(true);
    try {
      const promises: Promise<any>[] = [];

      if (profileName.trim() !== user?.name) {
        promises.push(account.updateName(profileName.trim()));
      }

      if (profileEmail.trim() !== (user?.email || "")) {
        if (!profileCurrentPassword) {
          Alert.alert("Error", "Current password is required to change email.");
          setProfileLoading(false);
          return;
        }
        promises.push(
          account.updateEmail(profileEmail.trim(), profileCurrentPassword),
        );
      }

      if (promises.length === 0) {
        Alert.alert("Info", "No changes to save.");
        setProfileLoading(false);
        return;
      }

      await Promise.all(promises);
      await checkAuth();
      setShowProfileModal(false);
      setProfileCurrentPassword("");
      Alert.alert("Success", "Profile updated successfully.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to update profile. Please try again.",
      );
    } finally {
      setProfileLoading(false);
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
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordModal(true);
          }}
          style={{ marginBottom: THEME.spacing.md }}
        />
        <PrimaryButton
          label="Edit Profile"
          onPress={() => {
            setProfileName(user?.name || "");
            setProfileEmail(user?.email || "");
            setProfileCurrentPassword("");
            setShowProfileModal(true);
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
              Version {Constants.expoConfig?.version ?? "1.0.2"} • Premium Edition
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

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: THEME.spacing.xl,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Change Password
            </Text>
            <TextInput
              style={modalInputStyle}
              placeholder="Current Password"
              placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              editable={!passwordLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="New Password (min 8 characters)"
              placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!passwordLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="Confirm New Password"
              placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!passwordLoading}
            />
            <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                disabled={passwordLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: isDark
                    ? THEME.dark.background.tertiary
                    : THEME.light.background.tertiary,
                }}
              >
                <Text
                  style={{
                    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={passwordLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: THEME.colors.primary,
                }}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: THEME.spacing.xl,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Edit Profile
            </Text>
            <TextInput
              style={modalInputStyle}
              placeholder="Full Name"
              placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
              value={profileName}
              onChangeText={setProfileName}
              editable={!profileLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="Email"
              placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={profileEmail}
              onChangeText={setProfileEmail}
              editable={!profileLoading}
            />
            {profileEmail.trim() !== (user?.email || "") && (
              <TextInput
                style={modalInputStyle}
                placeholder="Current Password (required for email change)"
                placeholderTextColor={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary}
                secureTextEntry
                value={profileCurrentPassword}
                onChangeText={setProfileCurrentPassword}
                editable={!profileLoading}
              />
            )}
            <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
              <TouchableOpacity
                onPress={() => setShowProfileModal(false)}
                disabled={profileLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: isDark
                    ? THEME.dark.background.tertiary
                    : THEME.light.background.tertiary,
                }}
              >
                <Text
                  style={{
                    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={profileLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: THEME.colors.primary,
                }}
              >
                {profileLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

