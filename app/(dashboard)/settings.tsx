/**
 * ⚙️ SETTINGS SCREEN - App Preferences
 * Manages notifications, security, profile, and app settings
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { usePermissions } from "@/src/hooks/usePermissions";
import { account, databases } from "@/src/services/appwrite";
import BiometricAuthService from "@/src/services/biometric.service";
import { useAuthStore } from "@/src/state/auth.store";
import { useBiometricStore } from "@/src/state/biometric.store";
import { useNotificationStore } from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import { Action } from "@/src/utils/permissions";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { logout, user, checkAuth, switchCompany } = useAuthStore();
  const { can } = usePermissions();
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

  // Edit Company modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyLoading, setCompanyLoading] = useState(false);

  // Switch Workspace modal state
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<any[]>([]);
  const [fetchingWorkspaces, setFetchingWorkspaces] = useState(false);

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

  const settingRowIconStyle: ViewStyle = {
    width: 36,
    height: 36,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: isDark ? THEME.dark.background.tertiary : THEME.light.background.tertiary,
    justifyContent: "center",
    alignItems: "center",
  };

  const settingRowLabelStyle: TextStyle = {
    fontSize: 15,
    fontWeight: "500",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
  };

  const renderSetting = (
    label: string,
    value: boolean,
    onToggle: (val: boolean) => void,
    icon?: string,
    description?: string,
  ) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: THEME.spacing.md,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: THEME.spacing.md }}>
        {icon && (
          <View style={settingRowIconStyle}>
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={THEME.colors.primary}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={settingRowLabelStyle}>
            {label}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: 12,
                color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
                marginTop: 2,
              }}
            >
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: isDark ? THEME.dark.border : THEME.light.border,
          true: THEME.colors.primary,
        }}
        thumbColor={THEME.colors.background.main}
      />
    </View>
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

  const loadCompanyDetails = async () => {
    if (!user?.companyId) return;
    try {
      // Assuming Companies collection exists - we fetch here simply, or it falls back
      const companies = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.COMPANIES,
      );
      const myCompany = companies.documents.find(
        (c) => c.$id === user.companyId,
      );
      if (myCompany) {
        setCompanyName(myCompany.name || "");
        setCompanySize(myCompany.size?.toString() || "");
      }
    } catch (e) {
      console.log("Failed fetching company, might not exist yet");
    }
  };

  const handleUpdateCompany = async () => {
    if (!user?.companyId) return;
    setCompanyLoading(true);
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.COMPANIES,
        user.companyId,
        {
          name: companyName,
          size: parseInt(companySize) || 0,
        },
      );
      Alert.alert("Success", "Company Details updated");
      setShowCompanyModal(false);
    } catch (e: any) {
      if (e.code === 404) {
        // create if collection schema allows
        try {
          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            DB_IDS.COMPANIES,
            user.companyId,
            { name: companyName, size: parseInt(companySize) || 0 },
          );
          Alert.alert("Success", "Company Details saved");
          setShowCompanyModal(false);
        } catch (creationError: any) {
          Alert.alert("Error", creationError.message);
        }
      } else {
        Alert.alert("Error", e.message);
      }
    } finally {
      setCompanyLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    setFetchingWorkspaces(true);
    try {
      // Find companies user has access to. Assuming role/multi-tenant mapping
      // For demonstration, list all companies they can read or specifically theirs
      const companies = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.COMPANIES,
      );
      setAvailableWorkspaces(companies.documents);
    } catch (e) {
      console.warn("Failed fetching workspaces", e);
      setAvailableWorkspaces([]);
    } finally {
      setFetchingWorkspaces(false);
    }
  };

  const activateWorkspaceSwitch = () => {
    loadWorkspaces();
    setShowWorkspaceModal(true);
  };

  const handleSelectWorkspace = (id: string, name: string) => {
    switchCompany(id);
    Alert.alert("Workspace Switched", `You are now in ${name || id} context.`);
    setShowWorkspaceModal(false);
  };

  useEffect(() => {
    loadCompanyDetails();
  }, [user?.companyId]);

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
        error?.message ||
          "Failed to change password. Please check your current password.",
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
        {/* Profile Header Card */}
        <PremiumCard
          style={{
            marginBottom: THEME.spacing.lg,
            alignItems: "center",
            paddingVertical: THEME.spacing.xl,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: THEME.colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: THEME.spacing.md,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "?"}
            </Text>
          </View>
          <Text
            style={{
              fontSize: THEME.typography.h5.fontSize,
              fontWeight: "700",
              color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            {user?.name || "User"}
          </Text>
          <Text
            style={{
              fontSize: THEME.typography.bodySm.fontSize,
              color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
              marginBottom: THEME.spacing.md,
            }}
          >
            {user?.email || ""}
          </Text>
          <View
            style={{
              paddingHorizontal: THEME.spacing.md,
              paddingVertical: THEME.spacing.xs,
              backgroundColor: THEME.colors.primaryLight,
              borderRadius: THEME.borderRadius.full,
            }}
          >
            <Text
              style={{
                fontSize: THEME.typography.labelSm.fontSize,
                fontWeight: "600",
                color: THEME.colors.primary,
              }}
            >
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member"}
            </Text>
          </View>
        </PremiumCard>

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
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          {renderSetting(
            "Push Notifications",
            notificationsEnabled,
            toggleNotificationsEnabled,
            "bell-outline",
            "Receive real-time HR alerts",
          )}
          <View style={{ height: 1, backgroundColor: isDark ? THEME.dark.border : THEME.light.border }} />
          {renderSetting("Email Reminders", emailReminders, setEmailReminders, "email-outline", "Get email digests and reminders")}
        </PremiumCard>

        <Text style={sectionTitleStyle}>Security</Text>
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          {biometricAvailable && (
            <>
              {renderSetting(
                `${biometricType === "face" ? "Face ID" : "Fingerprint"}`,
                biometricEnabled,
                handleBiometricToggle,
                biometricType === "face" ? "face-recognition" : "fingerprint",
                "Secure login with biometrics",
              )}
              <View style={{ height: 1, backgroundColor: isDark ? THEME.dark.border : THEME.light.border }} />
            </>
          )}
          <TouchableOpacity
            onPress={() => { setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setShowPasswordModal(true); }}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: THEME.spacing.md, gap: THEME.spacing.md }}
          >
            <View style={settingRowIconStyle}>
              <MaterialCommunityIcons name="lock-outline" size={20} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={settingRowLabelStyle}>Change Password</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary} />
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: isDark ? THEME.dark.border : THEME.light.border }} />
          <TouchableOpacity
            onPress={() => { setProfileName(user?.name || ""); setProfileEmail(user?.email || ""); setProfileCurrentPassword(""); setShowProfileModal(true); }}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: THEME.spacing.md, gap: THEME.spacing.md }}
          >
            <View style={settingRowIconStyle}>
              <MaterialCommunityIcons name="account-edit-outline" size={20} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={settingRowLabelStyle}>Edit Profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary} />
          </TouchableOpacity>
        </PremiumCard>

        {can(Action.MANAGE_COMPANY_SETTINGS) && (
          <>
            <Text style={sectionTitleStyle}>Company Management</Text>
            <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
              <TouchableOpacity
                onPress={() => setShowCompanyModal(true)}
                style={{
                  paddingVertical: THEME.spacing.sm,
                  borderBottomWidth: can(Action.SWITCH_WORKSPACE) ? 1 : 0,
                  borderBottomColor: isDark
                    ? THEME.dark.border
                    : THEME.light.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: THEME.colors.primary,
                  }}
                >
                  Edit Company Details
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark
                      ? THEME.dark.text.secondary
                      : THEME.light.text.secondary,
                  }}
                >
                  Update app metadata and sizing
                </Text>
              </TouchableOpacity>

              {can(Action.SWITCH_WORKSPACE) && (
                <TouchableOpacity
                  onPress={activateWorkspaceSwitch}
                  style={{ paddingVertical: THEME.spacing.sm }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: THEME.colors.primary,
                    }}
                  >
                    Switch Workspace
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark
                        ? THEME.dark.text.secondary
                        : THEME.light.text.secondary,
                    }}
                  >
                    Currently in: {user?.companyId}
                  </Text>
                </TouchableOpacity>
              )}
            </PremiumCard>
          </>
        )}

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
              Version {Constants.expoConfig?.version} • Premium Edition
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
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Change Password
            </Text>
            <TextInput
              style={modalInputStyle}
              placeholder="Current Password"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              editable={!passwordLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="New Password (min 8 characters)"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!passwordLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="Confirm New Password"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
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
                    color: isDark
                      ? THEME.dark.text.primary
                      : THEME.light.text.primary,
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
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Edit Profile
            </Text>
            <TextInput
              style={modalInputStyle}
              placeholder="Full Name"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={profileName}
              onChangeText={setProfileName}
              editable={!profileLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="Email"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
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
                placeholderTextColor={
                  isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
                }
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
                    color: isDark
                      ? THEME.dark.text.primary
                      : THEME.light.text.primary,
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

      {/* Edit Company Modal */}
      <Modal
        visible={showCompanyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCompanyModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: THEME.spacing.lg,
          }}
        >
          <View
            style={{
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              borderRadius: THEME.borderRadius.lg,
              padding: THEME.spacing.xl,
            }}
          >
            <Text style={titleStyle}>Edit Company Info</Text>

            <TextInput
              style={modalInputStyle}
              placeholder="Company Name"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={companyName}
              onChangeText={setCompanyName}
              editable={!companyLoading}
            />
            <TextInput
              style={modalInputStyle}
              placeholder="Company Size (Employees)"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={companySize}
              onChangeText={setCompanySize}
              keyboardType="numeric"
              editable={!companyLoading}
            />

            <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
              <TouchableOpacity
                onPress={() => setShowCompanyModal(false)}
                disabled={companyLoading}
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
                    color: isDark
                      ? THEME.dark.text.primary
                      : THEME.light.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateCompany}
                disabled={companyLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: THEME.colors.primary,
                }}
              >
                {companyLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Switch Workspace Modal */}
      <Modal
        visible={showWorkspaceModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWorkspaceModal(false)}
      >
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <View
            style={{
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: THEME.spacing.xl,
              maxHeight: "80%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Text style={titleStyle}>Switch Workspace</Text>

            {fetchingWorkspaces ? (
              <ActivityIndicator
                size="large"
                color={THEME.colors.primary}
                style={{ marginVertical: THEME.spacing.xl }}
              />
            ) : availableWorkspaces.length === 0 ? (
              <Text
                style={{
                  color: isDark
                    ? THEME.dark.text.primary
                    : THEME.light.text.primary,
                  marginVertical: THEME.spacing.lg,
                }}
              >
                No other workspaces found.
              </Text>
            ) : (
              <ScrollView
                style={{ maxHeight: 300, marginVertical: THEME.spacing.md }}
              >
                {availableWorkspaces.map((workspace) => (
                  <TouchableOpacity
                    key={workspace.$id}
                    style={{
                      padding: THEME.spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: isDark
                        ? THEME.dark.border
                        : THEME.light.border,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onPress={() =>
                      handleSelectWorkspace(workspace.$id, workspace.name)
                    }
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          color: isDark
                            ? THEME.dark.text.primary
                            : THEME.light.text.primary,
                        }}
                      >
                        {workspace.name || "Unnamed Company"}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isDark
                            ? THEME.dark.text.secondary
                            : THEME.light.text.secondary,
                        }}
                      >
                        ID: {workspace.$id}
                      </Text>
                    </View>
                    {user?.companyId === workspace.$id && (
                      <Text
                        style={{
                          color: THEME.colors.success,
                          fontWeight: "bold",
                        }}
                      >
                        Active
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <PrimaryButton
              label="Close"
              onPress={() => setShowWorkspaceModal(false)}
              variant="secondary"
            />
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
