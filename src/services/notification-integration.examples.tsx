/**
 * 🎯 MESSAGING INTEGRATION GUIDE
 * 
 * Complete guide on how to integrate the event-driven messaging system
 * into real HRMate app flows
 */

// ============================================================
// 1. INITIALIZATION - Call this on app startup
// ============================================================

import { NotificationsService } from "@/src/services/notifications.service";
import { eventService, EventType } from "@/src/services/event.service";

export async function initializeNotificationSystem(userId: string) {
  try {
    console.log("🚀 Initializing notification system...");

    // 1. Register device for push notifications
    const registered = await NotificationsService.registerDevice(userId);
    if (registered) {
      console.log("✅ Device registered for push notifications");
    }

    // 2. Load notification preferences
    // This is done automatically when opening NotificationCenter

    // 3. Set up notification listeners
    setupNotificationListeners();

    console.log("✅ Notification system initialized");
  } catch (error) {
    console.error("❌ Failed to initialize notifications:", error);
  }
}

// ============================================================
// 2. NOTIFICATION LISTENERS - Handle incoming notifications
// ============================================================

import { useNotificationStore } from "@/src/state/notifications.store";

function setupNotificationListeners() {
  // Listen for push notifications received while app is in foreground
  NotificationsService.listenForForegroundNotifications((notification) => {
    console.log("📬 Foreground notification received:", notification);
    
    // You can add local notification handling, analytics, etc.
    handleForegroundNotification(notification);
  });

  // Listen for notification responses (user tapped notification)
  NotificationsService.listenForNotifications((notification) => {
    console.log("🔔 User tapped notification:", notification);
    
    // Handle navigation, analytics, etc.
    handleNotificationTap(notification);
  });
}

function handleForegroundNotification(notification: any) {
  // Add custom logic here if needed
}

function handleNotificationTap(notification: any) {
  // Navigate to relevant screen based on notification type
  const eventType = notification.request.content.data?.eventType;
  
  switch (eventType) {
    case EventType.LEAVE_APPROVED:
      // Navigate to leaves screen
      break;
    case EventType.SALARY_PROCESSED:
      // Navigate to payslips screen
      break;
    default:
      // Navigate to notification center
      break;
  }
}

// ============================================================
// 3. EXAMPLE INTEGRATIONS - How to trigger events in real flows
// ============================================================

// ============= LEAVE REQUEST FLOW =============
export async function submitLeaveRequest(
  userId: string,
  companyId: string,
  leaveData: any
) {
  try {
    // ... your leave submission logic ...

    // Trigger notification event
    await eventService.triggerEvent({
      userId,
      companyId,
      eventType: EventType.LEAVE_APPLIED,
      data: {
        leaveType: leaveData.type,
        startDate: leaveData.startDate,
        noOfDays: leaveData.days,
        employeeName: leaveData.employeeName,
      },
      priority: "normal" as const,
    });

    return { success: true, notification: "Leave request submitted" };
  } catch (error) {
    console.error("Error submitting leave:", error);
    throw error;
  }
}

// ============= LEAVE APPROVAL FLOW (Admin) =============
export async function approveLeave(
  userId: string,
  companyId: string,
  leaveId: string,
  leaveData: any
) {
  try {
    // ... your leave approval logic ...

    // Trigger notification event
    await eventService.triggerEvent({
      userId, // Send to employee, not admin
      companyId,
      eventType: EventType.LEAVE_APPROVED,
      data: {
        leaveType: leaveData.type,
        startDate: leaveData.startDate,
        noOfDays: leaveData.days,
        approvedBy: leaveData.approverName,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error approving leave:", error);
    throw error;
  }
}

// ============= SALARY PROCESSING FLOW =============
export async function processMonthlySalary(
  companyId: string,
  employees: Array<{ id: string; name: string; salary: number }>
) {
  try {
    // ... your salary processing logic ...

    // Send notification to each employee
    for (const employee of employees) {
      await eventService.triggerEvent({
        userId: employee.id,
        companyId,
        eventType: EventType.SALARY_PROCESSED,
        data: {
          month: new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          amount: employee.salary,
          currency: "INR",
        },
      });
    }

    return { success: true, issued: employees.length };
  } catch (error) {
    console.error("Error processing salary:", error);
    throw error;
  }
}

// ============= ATTENDANCE MARKING FLOW =============
export async function markAttendance(
  userId: string,
  companyId: string,
  date: string,
  status: "present" | "absent" | "half-day"
) {
  try {
    // ... your attendance marking logic ...

    // Send notification to employee
    await eventService.triggerEvent({
      userId,
      companyId,
      eventType: EventType.ATTENDANCE_MARKED,
      data: {
        date,
        status,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking attendance:", error);
    throw error;
  }
}

// ============= EMPLOYEE ONBOARDING FLOW =============
export async function addNewEmployee(
  companyId: string,
  employeeData: any
) {
  try {
    // ... your employee creation logic ...
    const newEmployeeId = "newly_created_id";

    // Notify all employees about new team member
    const existingEmployees = []; // Fetch from database
    
    for (const emp of (existingEmployees as any[])) {
      await eventService.triggerEvent({
        userId: emp.id,
        companyId,
        eventType: EventType.EMPLOYEE_ADDED,
        data: {
          employeeName: employeeData.name,
          department: employeeData.department,
          position: employeeData.position,
        },
      });
    }

    return { success: true, employeeId: newEmployeeId };
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
}

// ============= PAYSLIP GENERATION FLOW =============
export async function generatePayslips(
  companyId: string,
  employees: any[]
) {
  try {
    // ... your payslip generation logic ...

    for (const employee of employees) {
      await eventService.triggerEvent({
        userId: employee.id,
        companyId,
        eventType: EventType.PAYSLIP_GENERATED,
        data: {
          month: new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          }),
          netAmount: employee.netSalary,
          payslipUrl: `/payslips/${employee.id}`,
        },
      });
    }

    return { success: true, generated: employees.length };
  } catch (error) {
    console.error("Error generating payslips:", error);
    throw error;
  }
}

// ============= HR ANNOUNCEMENT FLOW =============
export async function sendHRAnnounccement(
  companyId: string,
  announcement: {
    title: string;
    message: string;
    recipientUserIds: string[];
  }
) {
  try {
    // ... your announcement creation logic ...

    // Notify all specified recipients
    for (const userId of announcement.recipientUserIds) {
      await eventService.triggerEvent({
        userId,
        companyId,
        eventType: EventType.HR_ANNOUNCEMENT,
        data: {
          title: announcement.title,
          announcement: announcement.message,
          postedAt: new Date().toISOString(),
        },
      });
    }

    return { success: true, notified: announcement.recipientUserIds.length };
  } catch (error) {
    console.error("Error sending announcement:", error);
    throw error;
  }
}

// ============= OTP LOGIN FLOW =============
export async function sendLoginOTP(
  userId: string,
  email: string,
  otp: string
) {
  try {
    // This is CRITICAL - always send via SMS and Email
    await eventService.triggerEvent({
      userId,
      companyId: "system", // System-level event
      eventType: EventType.OTP_LOGIN,
      data: {
        otp,
        email,
        expiresIn: 10, // minutes
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// ============= SHIFT ASSIGNMENT FLOW =============
export async function assignShift(
  userId: string,
  companyId: string,
  shiftData: any
) {
  try {
    // ... your shift assignment logic ...

    await eventService.triggerEvent({
      userId,
      companyId,
      eventType: EventType.SHIFT_ASSIGNED,
      data: {
        shiftName: shiftData.name,
        shiftDate: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error assigning shift:", error);
    throw error;
  }
}

// ============================================================
// 4. USING IN REACT COMPONENTS
// ============================================================

import React, { useEffect } from "react";
import { View, Text } from "react-native";

export function MyComponent({ userId }: { userId: string }) {
  const { loadNotificationsFromServer, unreadCount } = useNotificationStore();

  useEffect(() => {
    // Load notifications when component mounts
    loadNotificationsFromServer(userId);

    // Optional: Set up periodic sync (e.g., every 30 seconds)
    const interval = setInterval(
      () => loadNotificationsFromServer(userId),
      30000
    );

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Dashboard</Text>
      {unreadCount > 0 && (
        <View style={{ padding: 10, backgroundColor: "#f0f0f0" }}>
          <Text>{unreadCount} unread notifications</Text>
        </View>
      )}
      {/* Rest of component */}
    </View>
  );
}

// ============================================================
// 5. PREFERENCES MANAGEMENT
// ============================================================

import { notificationPreferencesService } from "@/src/services/notification-preferences.service";

export async function updateUserPreferences(
  userId: string,
  preferences: Partial<{
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  }>
) {
  try {
    await notificationPreferencesService.updatePreferences(userId, preferences);
    console.log("✅ Preferences updated");
    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
}

// Example: Set quiet hours (9 PM to 8 AM)
export async function setQuietHours(userId: string) {
  await notificationPreferencesService.setQuietHours(userId, "21:00", "08:00");
}

// ============================================================
// 6. METRICS & ANALYTICS
// ============================================================

export async function getNotificationMetrics(userId: string) {
  // Get notification history
  const notifications = await eventService.getNotificationHistory(userId, 100);

  // Calculate metrics
  const metrics = {
    total: notifications.length,
    read: notifications.filter((n) => n.read).length,
    unread: notifications.filter((n) => !n.read).length,
    byType: {} as Record<string, number>,
    byChannel: {} as Record<string, number>,
  };

  for (const notif of notifications) {
    metrics.byType[notif.type] = (metrics.byType[notif.type] || 0) + 1;
    metrics.byChannel[notif.channel] = (metrics.byChannel[notif.channel] || 0) + 1;
  }

  return metrics;
}

// ============================================================
// 7. ERROR HANDLING & RETRY
// ============================================================

export async function retryFailedNotifications(userId: string) {
  try {
    const history = await eventService.getNotificationHistory(userId, 100);
    const failed = history.filter((n) => n.delivery_status === "failed");

    for (const notification of failed) {
      await eventService.retryFailedNotification(notification.$id);
    }

    return { success: true, retried: failed.length };
  } catch (error) {
    console.error("Error retrying notifications:", error);
    throw error;
  }
}

// ============================================================
// 8. CLEANUP - Call on app logout
// ============================================================

export async function cleanupNotificationSystem(userId: string) {
  try {
    // Unregister device
    await NotificationsService.unregisterDevice(userId);

    // Clear local notifications
    await NotificationsService.clearAllNotifications();

    console.log("✅ Notification system cleaned up");
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
  }
}

export default {
  initializeNotificationSystem,
  submitLeaveRequest,
  approveLeave,
  processMonthlySalary,
  markAttendance,
  addNewEmployee,
  generatePayslips,
  sendHRAnnounccement,
  sendLoginOTP,
  assignShift,
  updateUserPreferences,
  getNotificationMetrics,
  retryFailedNotifications,
  cleanupNotificationSystem,
};
