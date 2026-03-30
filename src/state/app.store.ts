import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "leave_request" | "payroll" | "alert" | "message";
  isRead: boolean;
  createdAt: string;
}

interface AppStore {
  // Theme
  theme: "light" | "dark" | "system";

  // Global loading
  isGlobalLoading: boolean;

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Navigation preferences
  lastVisitedTab: string;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setGlobalLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, "id" | "isRead" | "createdAt">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  setLastVisitedTab: (tab: string) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      isGlobalLoading: false,
      notifications: [],
      unreadCount: 0,
      lastVisitedTab: "index",

      setTheme: (theme) => set({ theme }),

      setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

      addNotification: (notification) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        const counter = (Math.random() * 0xffff) | 0;
        const newNotification: Notification = {
          ...notification,
          id: `notif_${timestamp}_${random}_${counter}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        const { notifications } = get();
        const updated = [newNotification, ...notifications].slice(0, 50); // Keep max 50
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });
      },

      markNotificationRead: (id) => {
        const { notifications } = get();
        const updated = notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        );
        set({
          notifications: updated,
          unreadCount: updated.filter((n) => !n.isRead).length,
        });
      },

      markAllNotificationsRead: () => {
        const { notifications } = get();
        set({
          notifications: notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      },

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      setLastVisitedTab: (tab) => set({ lastVisitedTab: tab }),
    }),
    {
      name: "hrmate-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        lastVisitedTab: state.lastVisitedTab,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    },
  ),
);
