/**
 * 📡 OFFLINE SUPPORT STORE - Zustand State Management
 * Manages offline state, data caching, and sync queue
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SyncQueueItem {
  id: string;
  action: "create" | "update" | "delete";
  resource: "employee" | "attendance" | "leave" | "payroll";
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineState {
  isOnline: boolean;
  lastSyncTime: number | null;
  syncInProgress: boolean;
  syncQueue: SyncQueueItem[];
  cachedData: Record<string, any>;

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  addToSyncQueue: (
    item: Omit<SyncQueueItem, "id" | "timestamp" | "retries">,
  ) => void;
  removeFromSyncQueue: (id: string) => void;
  clearSyncQueue: () => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setLastSyncTime: (time: number) => void;
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearCache: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: true,
      lastSyncTime: null,
      syncInProgress: false,
      syncQueue: [],
      cachedData: {},

      setOnlineStatus: (isOnline) => set(() => ({ isOnline })),

      addToSyncQueue: (item) =>
        set((state) => {
          const newItem: SyncQueueItem = {
            ...item,
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            retries: 0,
          };
          return {
            syncQueue: [...state.syncQueue, newItem],
          };
        }),

      removeFromSyncQueue: (id) =>
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
        })),

      clearSyncQueue: () => set(() => ({ syncQueue: [] })),

      setSyncInProgress: (inProgress) =>
        set(() => ({ syncInProgress: inProgress })),

      setLastSyncTime: (time) => set(() => ({ lastSyncTime: time })),

      cacheData: (key, data) =>
        set((state) => ({
          cachedData: {
            ...state.cachedData,
            [key]: {
              data,
              timestamp: Date.now(),
            },
          },
        })),

      getCachedData: (key) => {
        const state = get();
        return state.cachedData[key]?.data || null;
      },

      clearCache: () => set(() => ({ cachedData: {} })),
    }),
    {
      name: "offline-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

// Auto-sync network status
export const initializeNetworkListener = () => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    useOfflineStore.setState({
      isOnline: state.isConnected ?? true,
    });
  });
  return unsubscribe;
};

export default useOfflineStore;
