/**
 * 🔔 NOTIFICATIONS STORE - Zustand State Management
 * Manages notifications, notification center, and notification settings
 *
 * Features:
 * - Store notifications locally
 * - Mark as read/unread
 * - Filter by type/channel
 * - Manage preferences
 * - Sync with server
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Query } from "react-native-appwrite";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { databases } from "../services/appwrite";

// Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel?: "push" | "email" | "sms";
  read: boolean;
  createdAt: string;
  deliveryStatus?: "pending" | "sent" | "failed" | "retrying";
  actionUrl?: string;
  metadata?: Record<string, any>;
  priority?: "low" | "normal" | "high" | "critical";
}

// Notification filter
export interface NotificationFilter {
  type?: string;
  channel?: string;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
}

interface NotificationState {
  // Notifications
  notifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;

  // Loading states
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;

  // Preferences
  notificationsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  doNotDisturb: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;

  // Current filter
  currentFilter: NotificationFilter;

  // Actions - Notification Management
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">,
  ) => void;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;

  // Actions - Loading & Syncing
  setLoading: (loading: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Preferences
  toggleNotificationsEnabled: (enabled: boolean) => void;
  togglePushEnabled: (enabled: boolean) => void;
  toggleEmailEnabled: (enabled: boolean) => void;
  toggleSmsEnabled: (enabled: boolean) => void;
  toggleDoNotDisturb: (enabled: boolean) => void;
  setQuietHours: (start: string, end: string) => void;
  clearQuietHours: () => void;

  // Actions - Filtering & Search
  setFilter: (filter: NotificationFilter) => void;
  clearFilter: () => void;
  searchNotifications: (query: string) => void;

  // Actions - Server Sync
  loadNotificationsFromServer: (userId: string) => Promise<void>;
  syncNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      filteredNotifications: [],
      unreadCount: 0,
      isLoading: false,
      isSyncing: false,
      error: null,
      notificationsEnabled: true,
      pushEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      doNotDisturb: false,
      currentFilter: {},

      // Notification Management Actions
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `${Date.now()}-${Math.random()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          filteredNotifications: [
            newNotification,
            ...state.filteredNotifications,
          ],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          const filtered = state.filteredNotifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          const unreadCount = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            filteredNotifications: filtered,
            unreadCount,
          };
        });
      },

      markAsUnread: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: false } : n,
          );
          const filtered = state.filteredNotifications.map((n) =>
            n.id === id ? { ...n, read: false } : n,
          );
          const unreadCount = updated.filter((n) => !n.read).length;

          return {
            notifications: updated,
            filteredNotifications: filtered,
            unreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
          filteredNotifications: state.filteredNotifications.map((n) => ({
            ...n,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          const updated = state.notifications.filter((n) => n.id !== id);
          const filtered = state.filteredNotifications.filter(
            (n) => n.id !== id,
          );

          return {
            notifications: updated,
            filteredNotifications: filtered,
            unreadCount: notification?.read
              ? state.unreadCount
              : Math.max(0, state.unreadCount - 1),
          };
        });
      },

      clearAllNotifications: () => {
        set(() => ({
          notifications: [],
          filteredNotifications: [],
          unreadCount: 0,
        }));
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n,
          ),
          filteredNotifications: state.filteredNotifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n,
          ),
        }));
      },

      // Loading & Error Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      setError: (error) => set({ error }),

      // Preferences Actions
      toggleNotificationsEnabled: (enabled) => {
        set({ notificationsEnabled: enabled });
      },

      togglePushEnabled: (enabled) => {
        set({ pushEnabled: enabled });
      },

      toggleEmailEnabled: (enabled) => {
        set({ emailEnabled: enabled });
      },

      toggleSmsEnabled: (enabled) => {
        set({ smsEnabled: enabled });
      },

      toggleDoNotDisturb: (enabled) => {
        set({ doNotDisturb: enabled });
      },

      setQuietHours: (start, end) => {
        set({
          quietHoursStart: start,
          quietHoursEnd: end,
          doNotDisturb: true,
        });
      },

      clearQuietHours: () => {
        set({
          quietHoursStart: undefined,
          quietHoursEnd: undefined,
          doNotDisturb: false,
        });
      },

      // Filter Actions
      setFilter: (filter) => {
        set((state) => {
          const filtered = state.notifications.filter((n) => {
            if (filter.type && n.type !== filter.type) return false;
            if (filter.channel && n.channel !== filter.channel) return false;
            if (filter.read !== undefined && n.read !== filter.read)
              return false;
            if (filter.startDate && new Date(n.createdAt) < filter.startDate)
              return false;
            if (filter.endDate && new Date(n.createdAt) > filter.endDate)
              return false;
            return true;
          });

          return {
            currentFilter: filter,
            filteredNotifications: filtered,
          };
        });
      },

      clearFilter: () => {
        set((state) => ({
          currentFilter: {},
          filteredNotifications: state.notifications,
        }));
      },

      searchNotifications: (query) => {
        set((state) => {
          const q = query.toLowerCase();
          const filtered = state.notifications.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.message.toLowerCase().includes(q),
          );

          return {
            filteredNotifications: filtered,
          };
        });
      },

      // Server Sync Actions
      loadNotificationsFromServer: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const result = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            DB_IDS.NOTIFICATIONS,
            [Query.equal("user_id", userId), Query.orderDesc("created_at")],
          );

          const notifications: Notification[] = result.documents.map(
            (doc: any) => ({
              id: doc.$id,
              title: doc.title,
              message: doc.message,
              type: doc.type,
              channel: doc.channel,
              read: doc.read,
              createdAt: doc.created_at,
              deliveryStatus: doc.delivery_status,
              priority: doc.priority,
              metadata: doc.metadata ? JSON.parse(doc.metadata) : undefined,
            }),
          );

          const unreadCount = notifications.filter((n) => !n.read).length;

          set({
            notifications,
            filteredNotifications: notifications,
            unreadCount,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error?.message || "Failed to load notifications",
            isLoading: false,
          });
        }
      },

      syncNotifications: async (userId: string) => {
        set({ isSyncing: true });

        try {
          await (get() as NotificationState).loadNotificationsFromServer(
            userId,
          );
          set({ isSyncing: false });
        } catch (error: any) {
          set({
            error: error?.message || "Failed to sync notifications",
            isSyncing: false,
          });
        }
      },
    }),
    {
      name: "notifications-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        notificationsEnabled: state.notificationsEnabled,
        pushEnabled: state.pushEnabled,
        emailEnabled: state.emailEnabled,
        smsEnabled: state.smsEnabled,
        doNotDisturb: state.doNotDisturb,
        quietHoursStart: state.quietHoursStart,
        quietHoursEnd: state.quietHoursEnd,
      }),
    },
  ),
);

export default useNotificationStore;
