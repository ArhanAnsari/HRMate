/**
 * 🔔 NOTIFICATIONS SERVICE
 * Handles push notifications, scheduling, and notification management
 */

import * as Notifications from "expo-notifications";

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

export class NotificationsService {
  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  static async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    delay: number = 0,
  ) {
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

  static async scheduleLeaveApprovalNotification(
    employeeName: string,
    leaveType: string,
    delay: number = 5,
  ) {
    await this.sendLocalNotification(
      "Leave Request Approved",
      `${employeeName}'s ${leaveType} request has been approved`,
      { type: "leave_approval" },
      delay,
    );
  }

  static async scheduleSalaryProcessedNotification(delay: number = 5) {
    await this.sendLocalNotification(
      "Salary Processed",
      "Monthly salary has been processed successfully",
      { type: "salary_processed" },
      delay,
    );
  }

  static async getAllNotifications() {
    try {
      const notifications =
        await Notifications.getLastNotificationResponseAsync();
      return notifications;
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return null;
    }
  }

  static setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (
      response: Notifications.NotificationResponse,
    ) => void,
  ) {
    const receivedSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      });

    const notificationSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      });

    return () => {
      receivedSubscription.remove();
      notificationSubscription.remove();
    };
  }
}

export default NotificationsService;
