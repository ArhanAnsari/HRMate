/**
 * 🎯 EVENT SERVICE
 *
 * Central event-driven system for triggering notifications based on app events
 * Supports multiple channels: Push, Email, SMS
 *
 * Event Types:
 * - LEAVE_APPLIED: User applies for leave
 * - LEAVE_APPROVED: Leave request approved
 * - LEAVE_REJECTED: Leave request rejected
 * - SALARY_PROCESSED: Monthly salary processed
 * - ATTENDANCE_MARKED: Attendance marked
 * - EMPLOYEE_ADDED: New employee added to company
 * - OTP_LOGIN: OTP sent for login
 * - HR_ANNOUNCEMENT: HR makes an announcement
 * - PAYSLIP_GENERATED: Payslip generated
 * - SHIFT_ASSIGNED: Shift assigned to employee
 */

import { notificationPreferencesService } from "@/src/services/notification-preferences.service";
import { ID, Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { aiService } from "./ai.service";
import { databases } from "./appwrite";
import { messagingService } from "./messaging.service";

// Event types
export enum EventType {
  LEAVE_APPLIED = "LEAVE_APPLIED",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  LEAVE_REJECTED = "LEAVE_REJECTED",
  SALARY_PROCESSED = "SALARY_PROCESSED",
  ATTENDANCE_MARKED = "ATTENDANCE_MARKED",
  EMPLOYEE_ADDED = "EMPLOYEE_ADDED",
  OTP_LOGIN = "OTP_LOGIN",
  HR_ANNOUNCEMENT = "HR_ANNOUNCEMENT",
  PAYSLIP_GENERATED = "PAYSLIP_GENERATED",
  SHIFT_ASSIGNED = "SHIFT_ASSIGNED",
}

// Notification channel types
export enum NotificationChannel {
  PUSH = "push",
  EMAIL = "email",
  SMS = "sms",
}

// Priority levels
export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  CRITICAL = "critical",
}

// Event payload structure
export interface EventPayload {
  userId: string;
  companyId: string;
  eventType: EventType;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  timestamp?: string;
}

// Notification metadata structure
export interface NotificationMetadata {
  eventType: string;
  title: string;
  message: string;
  actionUrl?: string;
  [key: string]: any;
}

/**
 * Define which channels to use for each event type
 */
const EVENT_CHANNEL_MAPPING: Record<EventType, NotificationChannel[]> = {
  [EventType.LEAVE_APPLIED]: [NotificationChannel.PUSH],
  [EventType.LEAVE_APPROVED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.LEAVE_REJECTED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.SALARY_PROCESSED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.ATTENDANCE_MARKED]: [NotificationChannel.PUSH],
  [EventType.EMPLOYEE_ADDED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.OTP_LOGIN]: [NotificationChannel.SMS, NotificationChannel.EMAIL],
  [EventType.HR_ANNOUNCEMENT]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.PAYSLIP_GENERATED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
  [EventType.SHIFT_ASSIGNED]: [
    NotificationChannel.PUSH,
    NotificationChannel.EMAIL,
  ],
};

/**
 * Get appropriate priority for each event type
 */
const EVENT_PRIORITY_MAPPING: Record<EventType, NotificationPriority> = {
  [EventType.LEAVE_APPLIED]: NotificationPriority.NORMAL,
  [EventType.LEAVE_APPROVED]: NotificationPriority.HIGH,
  [EventType.LEAVE_REJECTED]: NotificationPriority.HIGH,
  [EventType.SALARY_PROCESSED]: NotificationPriority.HIGH,
  [EventType.ATTENDANCE_MARKED]: NotificationPriority.NORMAL,
  [EventType.EMPLOYEE_ADDED]: NotificationPriority.NORMAL,
  [EventType.OTP_LOGIN]: NotificationPriority.CRITICAL,
  [EventType.HR_ANNOUNCEMENT]: NotificationPriority.NORMAL,
  [EventType.PAYSLIP_GENERATED]: NotificationPriority.HIGH,
  [EventType.SHIFT_ASSIGNED]: NotificationPriority.NORMAL,
};

/**
 * Event Service - Manages event-driven notifications
 */
export const eventService = {
  /**
   * Trigger an event and send notifications via appropriate channels
   */
  async triggerEvent(payload: EventPayload): Promise<void> {
    try {
      const {
        userId,
        companyId,
        eventType,
        data,
        metadata = {},
        priority = EVENT_PRIORITY_MAPPING[eventType],
        timestamp = new Date().toISOString(),
      } = payload;

      console.log(`📢 Event triggered: ${eventType} for user ${userId}`);

      // Check user notification preferences
      const preferences =
        await notificationPreferencesService.getPreferences(userId);

      // Get channels for this event
      const channels = EVENT_CHANNEL_MAPPING[eventType];

      if (!channels || channels.length === 0) {
        console.warn(`⚠️ No channels configured for event: ${eventType}`);
        return;
      }

      // Generate AI-powered message
      const { title, message } = await aiService.generateNotificationMessage(
        eventType,
        data,
      );

      // Store notification in database
      const notificationDoc = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATIONS,
        ID.unique(),
        {
          user_id: userId,
          company_id: companyId,
          title,
          message,
          type: eventType,
          channel: channels[0], // Primary channel
          read: false,
          metadata: JSON.stringify({ ...metadata, data }),
          priority,
          delivery_status: "pending",
          event_type: eventType,
          created_at: timestamp,
        },
      );

      console.log(`✅ Notification stored: ${notificationDoc.$id}`);

      // Send through each enabled channel
      for (const channel of channels) {
        try {
          switch (channel) {
            case NotificationChannel.PUSH:
              if (preferences.pushEnabled) {
                await messagingService.sendPushNotification(
                  userId,
                  title,
                  message,
                  {
                    eventType,
                    notificationId: notificationDoc.$id,
                    ...metadata,
                  },
                );
              }
              break;

            case NotificationChannel.EMAIL:
              if (preferences.emailEnabled) {
                await messagingService.sendEmail(userId, title, message, {
                  eventType,
                  notificationId: notificationDoc.$id,
                  ...metadata,
                });
              }
              break;

            case NotificationChannel.SMS:
              if (preferences.smsEnabled) {
                await messagingService.sendSMS(userId, message, {
                  eventType,
                  notificationId: notificationDoc.$id,
                });
              }
              break;
          }

          // Log successful delivery
          await eventService.logNotificationDelivery(
            notificationDoc.$id,
            userId,
            channel,
            "sent",
          );
        } catch (error: any) {
          const errorMessage = error?.message || "Unknown error";
          console.error(
            `❌ Failed to send ${channel} notification: ${errorMessage}`,
          );

          // Log failed delivery
          await eventService.logNotificationDelivery(
            notificationDoc.$id,
            userId,
            channel,
            "failed",
            errorMessage,
          );
        }
      }
    } catch (error: any) {
      console.error(`❌ Error triggering event: ${error?.message}`);
      throw error;
    }
  },

  /**
   * Log notification delivery attempt
   */
  async logNotificationDelivery(
    notificationId: string,
    userId: string,
    channel: NotificationChannel,
    status: "pending" | "sent" | "failed" | "retrying",
    errorMessage?: string,
  ): Promise<void> {
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATION_LOGS,
        ID.unique(),
        {
          notification_id: notificationId,
          user_id: userId,
          channel,
          status,
          error_message: errorMessage || null,
          retry_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );
    } catch (error: any) {
      console.error(`Failed to log notification delivery: ${error?.message}`);
    }
  },

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      const result = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATIONS,
        [
          Query.equal("user_id", userId),
          Query.orderDesc("created_at"),
          Query.limit(limit),
          Query.offset(offset),
        ],
      );

      return result.documents;
    } catch (error: any) {
      console.error(`Failed to get notification history: ${error?.message}`);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATIONS,
        notificationId,
        {
          read: true,
        },
      );
    } catch (error: any) {
      console.error(`Failed to mark notification as read: ${error?.message}`);
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATIONS,
        notificationId,
      );
    } catch (error: any) {
      console.error(`Failed to delete notification: ${error?.message}`);
    }
  },

  /**
   * Retry failed notification delivery
   */
  async retryFailedNotification(notificationId: string): Promise<void> {
    try {
      // Get the notification document
      const notification = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.NOTIFICATIONS,
        notificationId,
      );

      if (notification.delivery_status === "failed") {
        // Rebuild and resend
        const payload: EventPayload = {
          userId: notification.user_id,
          companyId: notification.company_id,
          eventType: notification.event_type,
          data: notification.metadata ? JSON.parse(notification.metadata) : {},
          priority: notification.priority as NotificationPriority,
        };

        // Update delivery status
        await databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.NOTIFICATIONS,
          notificationId,
          {
            delivery_status: "retrying",
          },
        );

        await eventService.triggerEvent(payload);
      }
    } catch (error: any) {
      console.error(`Failed to retry notification: ${error?.message}`);
    }
  },
};

export default eventService;
