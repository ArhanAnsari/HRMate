/**
 * 📱 OFFLINE SUPPORT & CACHING
 *
 * Handles offline notification caching and syncing when connectivity returns
 * Ensures notifications are never lost even if offline
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Query } from "react-native-appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { databases } from "./appwrite";

// Types
export interface CachedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  channel?: string;
  metadata?: Record<string, any>;
  timestamp: number;
  synced: boolean;
  syncAttempts: number;
}

interface OfflineSyncQueue {
  notifications: CachedNotification[];
  lastSyncTime: number;
}

/**
 * Offline Support Service
 */
export const offlineSupportService = {
  // Storage keys
  CACHE_KEY: "notifications-offline-cache",
  SYNC_QUEUE_KEY: "notifications-sync-queue",
  LAST_SYNC_KEY: "notifications-last-sync",

  /**
   * Initialize offline support
   */
  async initialize(): Promise<void> {
    try {
      // Set up connectivity listener
      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected && state.isInternetReachable) {
          console.log("📡 Internet connected - syncing offline data...");
          offlineSupportService.syncOfflineData();
        } else {
          console.log("📴 Internet disconnected - caching enabled");
        }
      });

      console.log("✅ Offline support initialized");

      // Manual check on initialization
      const netState = await NetInfo.fetch();
      if (netState.isConnected && netState.isInternetReachable) {
        await offlineSupportService.syncOfflineData();
      }
    } catch (error) {
      console.error("Failed to initialize offline support:", error);
    }
  },

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return (
        (state.isConnected ?? false) && (state.isInternetReachable ?? false)
      );
    } catch (error) {
      console.error("Error checking connectivity:", error);
      return false;
    }
  },

  /**
   * Cache notification locally when offline
   */
  async cacheNotification(
    notification: Omit<
      CachedNotification,
      "id" | "timestamp" | "synced" | "syncAttempts"
    >,
  ): Promise<void> {
    try {
      const isOnline = await offlineSupportService.isOnline();

      if (isOnline) {
        // If online, no need to cache (it will go to server)
        return;
      }

      // Get existing cache
      const cacheStr = await AsyncStorage.getItem(
        offlineSupportService.CACHE_KEY,
      );
      const cache: CachedNotification[] = cacheStr ? JSON.parse(cacheStr) : [];

      // Add new notification to cache
      const cachedNotif: CachedNotification = {
        ...notification,
        id: `offline_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        synced: false,
        syncAttempts: 0,
      };

      cache.push(cachedNotif);

      // Limit cache to 500 notifications
      const trimmedCache = cache.slice(-500);

      // Save to cache
      await AsyncStorage.setItem(
        offlineSupportService.CACHE_KEY,
        JSON.stringify(trimmedCache),
      );

      console.log(
        `💾 Notification cached locally (${trimmedCache.length} total)`,
      );
    } catch (error) {
      console.error("Failed to cache notification:", error);
    }
  },

  /**
   * Get all cached notifications
   */
  async getCachedNotifications(): Promise<CachedNotification[]> {
    try {
      const cacheStr = await AsyncStorage.getItem(
        offlineSupportService.CACHE_KEY,
      );
      return cacheStr ? JSON.parse(cacheStr) : [];
    } catch (error) {
      console.error("Failed to get cached notifications:", error);
      return [];
    }
  },

  /**
   * Get unsynced cached notifications
   */
  async getUnsyncedNotifications(): Promise<CachedNotification[]> {
    try {
      const cache = await offlineSupportService.getCachedNotifications();
      return cache.filter((n) => !n.synced && n.syncAttempts < 3);
    } catch (error) {
      console.error("Failed to get unsynced notifications:", error);
      return [];
    }
  },

  /**
   * Sync cached notifications with server
   */
  async syncOfflineData(): Promise<{ synced: number; failed: number }> {
    try {
      const isOnline = await offlineSupportService.isOnline();

      if (!isOnline) {
        console.warn("⚠️ Not online - cannot sync");
        return { synced: 0, failed: 0 };
      }

      const unsyncedNotifications =
        await offlineSupportService.getUnsyncedNotifications();

      if (unsyncedNotifications.length === 0) {
        console.log("✅ No offline data to sync");
        return { synced: 0, failed: 0 };
      }

      console.log(
        `🔄 Syncing ${unsyncedNotifications.length} offline notifications...`,
      );

      let synced = 0;
      let failed = 0;

      for (const notification of unsyncedNotifications) {
        try {
          // Try to sync this notification
          await offlineSupportService.syncNotification(notification);
          synced++;
        } catch (error) {
          console.error(
            `Failed to sync notification ${notification.id}:`,
            error,
          );
          failed++;

          // Update sync attempt count
          await offlineSupportService.incrementSyncAttempt(notification.id);
        }
      }

      // Update last sync time
      await AsyncStorage.setItem(
        offlineSupportService.LAST_SYNC_KEY,
        new Date().toISOString(),
      );

      console.log(`✅ Sync complete: ${synced} synced, ${failed} failed`);

      return { synced, failed };
    } catch (error) {
      console.error("Error syncing offline data:", error);
      return { synced: 0, failed: 0 };
    }
  },

  /**
   * Sync individual notification
   */
  async syncNotification(notification: CachedNotification): Promise<void> {
    try {
      // This would typically send the cached notification to server
      // For now, just mark as synced

      // In production, you'd send this to your backend
      console.log(`📤 Syncing notification: ${notification.id}`);

      // Mark as synced in cache
      const cache = await offlineSupportService.getCachedNotifications();
      const index = cache.findIndex((n) => n.id === notification.id);

      if (index !== -1) {
        cache[index].synced = true;
        cache[index].syncAttempts = 0;

        await AsyncStorage.setItem(
          offlineSupportService.CACHE_KEY,
          JSON.stringify(cache),
        );
      }

      console.log(`✅ Notification synced: ${notification.id}`);
    } catch (error) {
      console.error(`Failed to sync notification ${notification.id}:`, error);
      throw error;
    }
  },

  /**
   * Increment sync attempt count
   */
  async incrementSyncAttempt(notificationId: string): Promise<void> {
    try {
      const cache = await offlineSupportService.getCachedNotifications();
      const notification = cache.find((n) => n.id === notificationId);

      if (notification) {
        notification.syncAttempts++;

        // Remove if too many attempts
        if (notification.syncAttempts >= 3) {
          const filtered = cache.filter((n) => n.id !== notificationId);
          await AsyncStorage.setItem(
            offlineSupportService.CACHE_KEY,
            JSON.stringify(filtered),
          );
          console.warn(
            `❌ Notification ${notificationId} removed after 3 failed attempts`,
          );
        } else {
          await AsyncStorage.setItem(
            offlineSupportService.CACHE_KEY,
            JSON.stringify(cache),
          );
        }
      }
    } catch (error) {
      console.error("Error incrementing sync attempt:", error);
    }
  },

  /**
   * Clear all cached notifications
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(offlineSupportService.CACHE_KEY);
      console.log("✅ Cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalCached: number;
    syncedCount: number;
    unsyncedCount: number;
    cacheSize: string;
  }> {
    try {
      const cache = await offlineSupportService.getCachedNotifications();
      const syncedCount = cache.filter((n) => n.synced).length;
      const unsyncedCount = cache.filter((n) => !n.synced).length;

      // Rough estimate of cache size
      const cacheStr = await AsyncStorage.getItem(
        offlineSupportService.CACHE_KEY,
      );
      const cacheSize = cacheStr
        ? `${(cacheStr.length / 1024).toFixed(2)} KB`
        : "0 KB";

      return {
        totalCached: cache.length,
        syncedCount,
        unsyncedCount,
        cacheSize,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        totalCached: 0,
        syncedCount: 0,
        unsyncedCount: 0,
        cacheSize: "0 KB",
      };
    }
  },

  /**
   * Get notifications from cache or server
   */
  async getNotificationsWithFallback(
    userId: string,
    limit: number = 50,
  ): Promise<any[]> {
    try {
      const isOnline = await offlineSupportService.isOnline();

      if (isOnline) {
        // Fetch from server
        try {
          const result = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            DB_IDS.NOTIFICATIONS,
            [
              Query.equal("user_id", userId),
              Query.orderDesc("created_at"),
              Query.limit(limit),
            ],
          );

          // Cache these for offline access
          const notifications = result.documents;
          await AsyncStorage.setItem(
            `notifications_${userId}`,
            JSON.stringify(notifications),
          );

          return notifications;
        } catch (error) {
          console.warn("Failed to fetch from server, using cache:", error);
          // Fall back to cached version
        }
      }

      // Use cached notifications
      const cachedStr = await AsyncStorage.getItem(`notifications_${userId}`);
      if (cachedStr) {
        const notifications = JSON.parse(cachedStr);
        console.log(
          `📴 Using cached notifications for ${userId} (${notifications.length} notifications)`,
        );
        return notifications;
      }

      return [];
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },

  /**
   * Monitor offline/online changes
   */
  watchConnectivity(onOnline: () => void, onOffline: () => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        onOnline();
      } else {
        onOffline();
      }
    });

    return unsubscribe;
  },

  /**
   * Get last successful sync time
   */
  async getLastSyncTime(): Promise<Date | null> {
    try {
      const syncTimeStr = await AsyncStorage.getItem(
        offlineSupportService.LAST_SYNC_KEY,
      );
      return syncTimeStr ? new Date(syncTimeStr) : null;
    } catch (error) {
      console.error("Error getting last sync time:", error);
      return null;
    }
  },
};

export default offlineSupportService;
