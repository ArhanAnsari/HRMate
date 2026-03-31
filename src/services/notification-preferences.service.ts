/**
 * 🎚️ NOTIFICATION PREFERENCES SERVICE
 *
 * Manages user notification preferences and settings
 * - Toggle push/email/SMS
 * - Set quiet hours (do not disturb)
 * - Per-event notification settings
 */

import { Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { databases } from "./appwrite";

export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  leaveNotifications: boolean;
  salaryNotifications: boolean;
  attendanceNotifications: boolean;
  announcementNotifications: boolean;
  doNotDisturbStart?: string;
  doNotDisturbEnd?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Notification Preferences Service
 */
export const notificationPreferencesService = {
  /**
   * Get user's notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATION_PREFERENCES,
        [Query.equal("user_id", userId)],
      );

      if (result.documents.length === 0) {
        // Create default preferences
        return await notificationPreferencesService.createDefaultPreferences(
          userId,
        );
      }

      const doc = result.documents[0];
      return {
        userId: doc.user_id,
        pushEnabled: doc.push_enabled || true,
        emailEnabled: doc.email_enabled || true,
        smsEnabled: doc.sms_enabled || false,
        leaveNotifications: doc.leave_notifications || true,
        salaryNotifications: doc.salary_notifications || true,
        attendanceNotifications: doc.attendance_notifications || true,
        announcementNotifications: doc.announcement_notifications || true,
        doNotDisturbStart: doc.do_not_disturb_start,
        doNotDisturbEnd: doc.do_not_disturb_end,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
      };
    } catch (error: any) {
      console.error(`Failed to get preferences: ${error?.message}`);
      // Return default preferences on error
      return {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        leaveNotifications: true,
        salaryNotifications: true,
        attendanceNotifications: true,
        announcementNotifications: true,
      };
    }
  },

  /**
   * Create default preferences for new user
   */
  async createDefaultPreferences(
    userId: string,
  ): Promise<NotificationPreferences> {
    try {
      const now = new Date().toISOString();
      const result = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATION_PREFERENCES,
        "unique()",
        {
          user_id: userId,
          push_enabled: true,
          email_enabled: true,
          sms_enabled: false,
          leave_notifications: true,
          salary_notifications: true,
          attendance_notifications: true,
          announcement_notifications: true,
          created_at: now,
          updated_at: now,
        },
      );

      return {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        leaveNotifications: true,
        salaryNotifications: true,
        attendanceNotifications: true,
        announcementNotifications: true,
        createdAt: now,
        updatedAt: now,
      };
    } catch (error: any) {
      console.error(`Failed to create default preferences: ${error?.message}`);
      throw error;
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    try {
      const existing =
        await notificationPreferencesService.getPreferences(userId);

      // Find document ID
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATION_PREFERENCES,
        [Query.equal("user_id", userId)],
      );

      if (result.documents.length === 0) {
        throw new Error("Preferences not found");
      }

      const docId = result.documents[0].$id;
      const updateData: Record<string, any> = {};

      // Map from camelCase to snake_case for database
      if (preferences.pushEnabled !== undefined) {
        updateData.push_enabled = preferences.pushEnabled;
      }
      if (preferences.emailEnabled !== undefined) {
        updateData.email_enabled = preferences.emailEnabled;
      }
      if (preferences.smsEnabled !== undefined) {
        updateData.sms_enabled = preferences.smsEnabled;
      }
      if (preferences.leaveNotifications !== undefined) {
        updateData.leave_notifications = preferences.leaveNotifications;
      }
      if (preferences.salaryNotifications !== undefined) {
        updateData.salary_notifications = preferences.salaryNotifications;
      }
      if (preferences.attendanceNotifications !== undefined) {
        updateData.attendance_notifications =
          preferences.attendanceNotifications;
      }
      if (preferences.announcementNotifications !== undefined) {
        updateData.announcement_notifications =
          preferences.announcementNotifications;
      }
      if (preferences.doNotDisturbStart !== undefined) {
        updateData.do_not_disturb_start = preferences.doNotDisturbStart;
      }
      if (preferences.doNotDisturbEnd !== undefined) {
        updateData.do_not_disturb_end = preferences.doNotDisturbEnd;
      }

      updateData.updated_at = new Date().toISOString();

      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATION_PREFERENCES,
        docId,
        updateData,
      );

      console.log(`✅ Preferences updated for user: ${userId}`);

      // Return updated preferences
      return await notificationPreferencesService.getPreferences(userId);
    } catch (error: any) {
      console.error(`Failed to update preferences: ${error?.message}`);
      throw error;
    }
  },

  /**
   * Check if user is in quiet hours (do not disturb)
   */
  isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.doNotDisturbStart || !preferences.doNotDisturbEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 1430 for 14:30

    const startTime = parseInt(preferences.doNotDisturbStart.replace(":", ""));
    const endTime = parseInt(preferences.doNotDisturbEnd.replace(":", ""));

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  },

  /**
   * Check if specific notification type is enabled for user
   */
  isNotificationTypeEnabled(
    preferences: NotificationPreferences,
    notificationType: string,
  ): boolean {
    switch (notificationType) {
      case "LEAVE_APPLIED":
      case "LEAVE_APPROVED":
      case "LEAVE_REJECTED":
        return preferences.leaveNotifications;

      case "SALARY_PROCESSED":
      case "PAYSLIP_GENERATED":
        return preferences.salaryNotifications;

      case "ATTENDANCE_MARKED":
        return preferences.attendanceNotifications;

      case "HR_ANNOUNCEMENT":
      case "EMPLOYEE_ADDED":
      case "SHIFT_ASSIGNED":
        return preferences.announcementNotifications;

      default:
        return true;
    }
  },

  /**
   * Determine if notification should be sent based on preferences
   */
  shouldSendNotification(
    preferences: NotificationPreferences,
    channel: "push" | "email" | "sms",
    notificationType: string,
  ): boolean {
    // Check if quiet hours are active
    if (notificationPreferencesService.isInQuietHours(preferences)) {
      // Still allow critical notifications (OTP, urgent alerts)
      if (!isHighPriorityNotification(notificationType)) {
        return false;
      }
    }

    // Check if channel is enabled
    const channelEnabled =
      channel === "push"
        ? preferences.pushEnabled
        : channel === "email"
          ? preferences.emailEnabled
          : preferences.smsEnabled;

    if (!channelEnabled) {
      return false;
    }

    // Check if notification type is enabled
    return notificationPreferencesService.isNotificationTypeEnabled(
      preferences,
      notificationType,
    );
  },

  /**
   * Toggle push notifications
   */
  async togglePushNotifications(
    userId: string,
    enabled: boolean,
  ): Promise<void> {
    await notificationPreferencesService.updatePreferences(userId, {
      pushEnabled: enabled,
    });
  },

  /**
   * Toggle email notifications
   */
  async toggleEmailNotifications(
    userId: string,
    enabled: boolean,
  ): Promise<void> {
    await notificationPreferencesService.updatePreferences(userId, {
      emailEnabled: enabled,
    });
  },

  /**
   * Toggle SMS notifications
   */
  async toggleSmsNotifications(
    userId: string,
    enabled: boolean,
  ): Promise<void> {
    await notificationPreferencesService.updatePreferences(userId, {
      smsEnabled: enabled,
    });
  },

  /**
   * Set quiet hours
   */
  async setQuietHours(
    userId: string,
    startTime: string, // HH:MM format
    endTime: string,
  ): Promise<void> {
    await notificationPreferencesService.updatePreferences(userId, {
      doNotDisturbStart: startTime,
      doNotDisturbEnd: endTime,
    });
  },

  /**
   * Clear quiet hours
   */
  async clearQuietHours(userId: string): Promise<void> {
    await notificationPreferencesService.updatePreferences(userId, {
      doNotDisturbStart: undefined,
      doNotDisturbEnd: undefined,
    });
  },
};

/**
 * Determine if a notification type is high priority (always send)
 */
function isHighPriorityNotification(notificationType: string): boolean {
  const highPriorityTypes = ["OTP_LOGIN"];
  return highPriorityTypes.includes(notificationType);
}

export default notificationPreferencesService;
