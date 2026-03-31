/**
 * 🔔 NOTIFICATION CENTER SCREEN
 * Display and manage all notifications
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    Notification,
    useNotificationStore,
} from "@/src/state/notifications.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const NotificationCenter: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "leave_approval":
        return "calendar-check";
      case "salary_processed":
        return "cash-check";
      case "attendance":
        return "clock-check";
      default:
        return "bell";
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
    headerTitle: {
      fontSize: THEME.typography.h4.fontSize,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
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
    },
    notificationItemUnread: {
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
    },
    icon: {
      marginRight: THEME.spacing.md,
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
    },
    notificationTime: {
      fontSize: THEME.typography.bodyXs.fontSize,
      color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary,
      marginTop: THEME.spacing.xs,
    },
    actions: {
      justifyContent: "center",
    },
    deleteButton: {
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

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.notificationItemRead : styles.notificationItemUnread,
      ]}
      onPress={() => !item.read && markAsRead(item.id)}
    >
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name={getNotificationIcon(item.type)}
          size={24}
          color={THEME.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose}>
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
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔔</Text>
          <Text style={styles.emptyStateText}>No notifications yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text
            style={{
              color: THEME.colors.primary,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            Mark all as read
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={() => (
          <TouchableOpacity
            onPress={clearAllNotifications}
            style={{
              paddingVertical: THEME.spacing.lg,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: THEME.colors.danger,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Clear all notifications
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default NotificationCenter;
