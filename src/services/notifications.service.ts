/**
 * 🔔 NOTIFICATIONS SERVICE
 * Handles push notifications, scheduling, and notification management
 *
 * Features:
 * - Request notification permissions
 * - Send local notifications
 * - Register device tokens
 * - Listen to notification events
 * - Handle background notifications
 */

import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { messagingService } from "./messaging.service";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Response received from sending a push notification
let notification: Notifications.Notification | undefined;

export class NotificationsService {
  /**
   * Request notification permissions from user
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  /**
   * Get device token for push notifications
   *
   * This token is used to send push notifications to this specific device
   */
  static async getDeviceToken(): Promise<string | null> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn("⚠️ Must use physical device for push notifications");
        return null;
      }

      // Get the Expo push token
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

      if (!projectId) {
        console.warn("⚠️ Project ID not found. Cannot get device token.");
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log(
        `✅ Device token obtained: ${token.data.substring(0, 20)}...`,
      );
      return token.data;
    } catch (error) {
      console.error("❌ Failed to get device token:", error);
      return null;
    }
  }

  /**
   * Register device for push notifications
   * Should be called during app initialization
   */
  static async registerDevice(userId: string): Promise<boolean> {
    try {
      // Request permissions first
      const hasPermission = await NotificationsService.requestPermissions();
      if (!hasPermission) {
        console.warn("⚠️ Notification permissions not granted");
        return false;
      }

      // Get device token
      const deviceToken = await NotificationsService.getDeviceToken();
      if (!deviceToken) {
        console.warn("⚠️ Could not obtain device token");
        return false;
      }

      // Determine platform
      let platform = "expo";
      if (Platform.OS === "ios") {
        platform = "ios";
      } else if (Platform.OS === "android") {
        platform = "android";
      } else if (Platform.OS === "web") {
        platform = "web";
      }

      // Get device name (use device type as fallback)
      const deviceType = await Device.getDeviceTypeAsync();
      const deviceName = `${Platform.OS} Device (${deviceType})`;

      // Register with messaging service
      const result = await messagingService.registerDeviceToken(
        userId,
        deviceToken,
        platform as any,
        deviceName,
      );

      if (result.success) {
        console.log(`✅ Device registered for push notifications`);
        return true;
      } else {
        console.error(`❌ Failed to register device: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to register device:", error);
      return false;
    }
  }

  /**
   * Send local notification
   *
   * Used for testing or immediate notifications
   */
  static async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delay: number = 0,
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: "default",
          badge: 1,
        },
        trigger: delay > 0 ? { seconds: delay, type: "time" as any } : null,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  }

  /**
   * Listen for incoming notifications
   */
  static listenForNotifications(
    callback: (notification: Notifications.Notification) => void,
  ): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        callback(response.notification);
      },
    );

    return () => {
      subscription.remove();
    };
  }

  /**
   * Listen for notifications received while app is in foreground
   */
  static listenForForegroundNotifications(
    callback: (notification: Notifications.Notification) => void,
  ): () => void {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        callback(notification);
      },
    );

    return () => {
      subscription.remove();
    };
  }

  /**
   * Unregister device from push notifications
   */
  static async unregisterDevice(userId: string): Promise<boolean> {
    try {
      const deviceToken = await NotificationsService.getDeviceToken();
      if (!deviceToken) {
        return false;
      }

      const result = await messagingService.unregisterDeviceToken(
        userId,
        deviceToken,
      );

      return result.success;
    } catch (error) {
      console.error("Failed to unregister device:", error);
      return false;
    }
  }

  /**
   * Clear all notifications from the device
   */
  static async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }

  /**
   * Get last notification response
   */
  static async getLastNotificationResponse(): Promise<any> {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.error("Failed to get last notification:", error);
      return null;
    }
  }
}

export default NotificationsService;
