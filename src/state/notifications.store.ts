/**
 * 🔔 NOTIFICATIONS STORE - Zustand State Management
 * Manages notifications, notification center, and notification settings
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "leave_approval" | "salary_processed" | "attendance" | "general";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  notificationsEnabled: boolean;

  // Actions
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  toggleNotificationsEnabled: (enabled: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      notificationsEnabled: true,

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `${Date.now()}-${Math.random()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          const unreadCount = updated.filter((n) => !n.read).length;
          return { notifications: updated, unreadCount };
        }),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      deleteNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            unreadCount: notification?.read
              ? state.unreadCount
              : Math.max(0, state.unreadCount - 1),
          };
        }),

      clearAllNotifications: () =>
        set(() => ({
          notifications: [],
          unreadCount: 0,
        })),

      toggleNotificationsEnabled: (enabled) =>
        set(() => ({ notificationsEnabled: enabled })),
    }),
    {
      name: "notifications-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useNotificationStore;
