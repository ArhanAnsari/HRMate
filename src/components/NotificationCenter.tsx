/**
 * 🔔 NOTIFICATION CENTER SCREEN
 * Comprehensive notification management with filtering, preferences, and delivery tracking
 *
 * Features:
 * - View all notifications
 * - Filter by type/channel/read status
 * - Mark as read/unread
 * - Delete individual or all
 * - Push notification preferences
 * - Quiet hours management
 * - Delivery status tracking
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import { notificationPreferencesService } from "@/src/services/notification-preferences.service";
import {
    Notification,
    useNotificationStore,
} from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationWithReadStatus extends Notification {
  read: boolean;
}

export const NotificationCenter: React.FC<{
  onClose?: () => void;
  userId?: string;
}> = ({ onClose, userId }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    notifications,
    filteredNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
    setFilter,
    clearFilter,
    unreadCount,
    loadNotificationsFromServer,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = React.useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [preferences, setPreferences] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Load preferences on mount
  useEffect(() => {
    if (userId) {
      loadPreferences();
      loadNotificationsFromServer(userId);
    }
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;
    try {
      const prefs = await notificationPreferencesService.getPreferences(userId);
      setPreferences(prefs);
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  };

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (userId) {
      await loadNotificationsFromServer(userId);
    }
    setRefreshing(false);
  }, [userId, loadNotificationsFromServer]);

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);

    if (filter === "all") {
      clearFilter();
    } else if (filter === "unread") {
      setFilter({ read: false });
    } else {
      setFilter({ type: filter });
    }
  };

  const getNotificationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      LEAVE_APPLIED: "calendar-plus",
      LEAVE_APPROVED: "calendar-check",
      LEAVE_REJECTED: "calendar-remove",
      SALARY_PROCESSED: "cash-check",
      ATTENDANCE_MARKED: "clock-check",
      EMPLOYEE_ADDED: "account-plus",
      OTP_LOGIN: "lock-check",
      HR_ANNOUNCEMENT: "megaphone",
      PAYSLIP_GENERATED: "file-document-check",
      SHIFT_ASSIGNED: "calendar-clock",
    };
    return iconMap[type] || "bell";
  };

  const getChannelBadge = (channel?: string) => {
    const badges: Record<
      string,
      { icon: string; label: string; color: string }
    > = {
      push: { icon: "bell", label: "Push", color: THEME.colors.primary },
      email: { icon: "email", label: "Email", color: "#2196F3" },
      sms: { icon: "message-text", label: "SMS", color: "#FF9800" },
    };
    return badges[channel || "push"] || badges.push;
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "critical":
        return THEME.colors.danger;
      case "high":
        return "#FF9800";
      case "normal":
        return THEME.colors.primary;
      case "low":
        return THEME.colors.success;
      default:
        return THEME.colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark
        ? THEME.dark.background.main
        : THEME.light.background.main,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: THEME.typography.h4.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.xs,
    },
    unreadBadge: {
      fontSize: 12,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    },
    headerActions: {
      flexDirection: "row",
      gap: THEME.spacing.md,
    },
    actionButton: {
      padding: THEME.spacing.sm,
    },
    filterBar: {
      flexDirection: "row",
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      gap: THEME.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    filterChip: {
      paddingHorizontal: THEME.spacing.md,
      paddingVertical: THEME.spacing.sm,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    filterChipActive: {
      backgroundColor: THEME.colors.primary,
      borderColor: THEME.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: "500",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    filterChipTextActive: {
      color: "white",
    },
    notificationItem: {
      flexDirection: "row",
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    notificationItemRead: {
      backgroundColor: "transparent",
      opacity: 0.6,
    },
    notificationItemUnread: {
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
    },
    icon: {
      marginRight: THEME.spacing.md,
      justifyContent: "center",
    },
    priorityIndicator: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 3,
      height: "100%",
    },
    content: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: THEME.typography.label.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.xs,
    },
    notificationMessage: {
      fontSize: THEME.typography.bodySm.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      lineHeight: 18,
      marginBottom: THEME.spacing.xs,
    },
    notificationMeta: {
      flexDirection: "row",
      gap: THEME.spacing.sm,
      alignItems: "center",
    },
    notificationTime: {
      fontSize: THEME.typography.bodyXs.fontSize,
      color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary,
    },
    channelBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      backgroundColor: "transparent",
    },
    channelBadgeText: {
      fontSize: 10,
      fontWeight: "500",
    },
    actions: {
      justifyContent: "space-between",
      alignItems: "center",
      gap: THEME.spacing.sm,
    },
    actionIconButton: {
      padding: THEME.spacing.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: THEME.spacing.lg,
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: THEME.spacing.md,
    },
    emptyStateText: {
      fontSize: THEME.typography.body.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      textAlign: "center",
    },
    footerActions: {
      paddingVertical: THEME.spacing.lg,
      paddingHorizontal: THEME.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
      flexDirection: "row",
      gap: THEME.spacing.md,
    },
    footerButton: {
      flex: 1,
      paddingVertical: THEME.spacing.md,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
    },
    footerButtonText: {
      fontSize: 12,
      fontWeight: "600",
    },
    // Preferences Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      flex: 1,
      backgroundColor: isDark
        ? THEME.dark.background.main
        : THEME.light.background.main,
      marginTop: "30%",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    modalHeader: {
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: THEME.typography.h4.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    preferencesSection: {
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    preferenceSectionTitle: {
      fontSize: THEME.typography.label.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: THEME.spacing.md,
    },
    preferenceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: THEME.spacing.md,
    },
    preferenceLabel: {
      fontSize: THEME.typography.body.fontSize,
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const renderNotificationItem = ({
    item,
  }: {
    item: NotificationWithReadStatus;
  }) => {
    const channelBadge = getChannelBadge(item.channel);
    const priorityColor = getPriorityColor(item.priority);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          item.read
            ? styles.notificationItemRead
            : styles.notificationItemUnread,
        ]}
        onPress={() => !item.read && markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.priorityIndicator, { backgroundColor: priorityColor }]}
        />

        <View style={styles.icon}>
          <MaterialCommunityIcons
            name={getNotificationIcon(item.type) as any}
            size={24}
            color={THEME.colors.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationTime}>
              {formatTime(item.createdAt)}
            </Text>
            <View
              style={[
                styles.channelBadge,
                { borderWidth: 0.5, borderColor: channelBadge.color },
              ]}
            >
              <MaterialCommunityIcons
                name={channelBadge.icon as any}
                size={9}
                color={channelBadge.color}
              />
              <Text
                style={[styles.channelBadgeText, { color: channelBadge.color }]}
              >
                {channelBadge.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {!item.read && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: THEME.colors.primary,
              }}
            />
          )}
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={() => deleteNotification(item.id)}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPreferencesModal = () => {
    if (!preferences) return null;

    return (
      <Modal
        visible={showPreferences}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPreferences(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <TouchableOpacity onPress={() => setShowPreferences(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={
                    isDark ? THEME.dark.text.primary : THEME.light.text.primary
                  }
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Notification Channels */}
              <View style={styles.preferencesSection}>
                <Text style={styles.preferenceSectionTitle}>Channels</Text>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Push Notifications</Text>
                  <Switch
                    value={preferences.pushEnabled || false}
                    onValueChange={(value) => {
                      if (userId) {
                        notificationPreferencesService.togglePushNotifications(
                          userId,
                          value,
                        );
                        setPreferences({ ...preferences, pushEnabled: value });
                      }
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>
                    Email Notifications
                  </Text>
                  <Switch
                    value={preferences.emailEnabled || false}
                    onValueChange={(value) => {
                      if (userId) {
                        notificationPreferencesService.toggleEmailNotifications(
                          userId,
                          value,
                        );
                        setPreferences({ ...preferences, emailEnabled: value });
                      }
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>SMS Notifications</Text>
                  <Switch
                    value={preferences.smsEnabled || false}
                    onValueChange={(value) => {
                      if (userId) {
                        notificationPreferencesService.toggleSmsNotifications(
                          userId,
                          value,
                        );
                        setPreferences({ ...preferences, smsEnabled: value });
                      }
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>
              </View>

              {/* Notification Types */}
              <View style={styles.preferencesSection}>
                <Text style={styles.preferenceSectionTitle}>
                  Notification Types
                </Text>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Leave Updates</Text>
                  <Switch
                    value={preferences.leaveNotifications || false}
                    onValueChange={(value) => {
                      setPreferences({
                        ...preferences,
                        leaveNotifications: value,
                      });
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Salary Updates</Text>
                  <Switch
                    value={preferences.salaryNotifications || false}
                    onValueChange={(value) => {
                      setPreferences({
                        ...preferences,
                        salaryNotifications: value,
                      });
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Attendance Updates</Text>
                  <Switch
                    value={preferences.attendanceNotifications || false}
                    onValueChange={(value) => {
                      setPreferences({
                        ...preferences,
                        attendanceNotifications: value,
                      });
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>

                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>HR Announcements</Text>
                  <Switch
                    value={preferences.announcementNotifications || false}
                    onValueChange={(value) => {
                      setPreferences({
                        ...preferences,
                        announcementNotifications: value,
                      });
                    }}
                    trackColor={{
                      false: isDark ? THEME.dark.border : THEME.light.border,
                      true: THEME.colors.primary,
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (filteredNotifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadBadge}>{unreadCount} unread</Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPreferences(true)}
            >
              <MaterialCommunityIcons
                name="cog"
                size={24}
                color={
                  isDark ? THEME.dark.text.primary : THEME.light.text.primary
                }
              />
            </TouchableOpacity>
            {onClose && (
              <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={
                    isDark ? THEME.dark.text.primary : THEME.light.text.primary
                  }
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔔</Text>
          <Text style={styles.emptyStateText}>
            {selectedFilter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </Text>
        </View>
        {renderPreferencesModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadBadge}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowPreferences(true)}
          >
            <MaterialCommunityIcons
              name="cog"
              size={24}
              color={
                isDark ? THEME.dark.text.primary : THEME.light.text.primary
              }
            />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={
                  isDark ? THEME.dark.text.primary : THEME.light.text.primary
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
      >
        {[
          "all",
          "unread",
          "LEAVE_APPROVED",
          "SALARY_PROCESSED",
          "HR_ANNOUNCEMENT",
        ].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter === "all"
                ? "All"
                : filter === "unread"
                  ? "Unread"
                  : filter.replace(/_/g, " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          filteredNotifications.length > 0 ? (
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: THEME.colors.primary,
                    borderColor: THEME.colors.primary,
                  },
                ]}
                onPress={markAllAsRead}
              >
                <Text style={[styles.footerButtonText, { color: "white" }]}>
                  Mark All as Read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: "transparent",
                    borderColor: THEME.colors.danger,
                  },
                ]}
                onPress={clearAllNotifications}
              >
                <Text
                  style={[
                    styles.footerButtonText,
                    { color: THEME.colors.danger },
                  ]}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {renderPreferencesModal()}
    </SafeAreaView>
  );
};

export default NotificationCenter;
