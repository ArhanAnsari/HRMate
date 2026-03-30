import { create } from "zustand";
import {
  AttendanceRecord,
  attendanceService,
  AttendanceStats,
} from "../services/attendance.service";

interface AttendanceStore {
  records: AttendanceRecord[];
  stats: AttendanceStats | null;
  weeklyTrend: any[];
  monthlyTrend: any[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTodayStats: () => Promise<void>;
  fetchTodayRecords: () => Promise<void>;
  fetchWeeklyTrend: () => Promise<void>;
  fetchMonthlyTrend: () => Promise<void>;
  checkIn: (employeeId: string) => Promise<void>;
  checkOut: (employeeId: string) => Promise<void>;
  clearError: () => void;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  records: [],
  stats: null,
  weeklyTrend: [],
  monthlyTrend: [],
  isLoading: false,
  error: null,

  fetchTodayStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await attendanceService.getTodayStats();
      set({ stats, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch stats";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchTodayRecords: async () => {
    set({ isLoading: true, error: null });
    try {
      const records = await attendanceService.getTodayRecords();
      set({ records, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch records";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchWeeklyTrend: async () => {
    set({ isLoading: true, error: null });
    try {
      const weeklyTrend = await attendanceService.getWeeklyTrend();
      set({ weeklyTrend, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch trend";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchMonthlyTrend: async () => {
    set({ isLoading: true, error: null });
    try {
      const monthlyTrend = await attendanceService.getMonthlyTrend();
      set({ monthlyTrend, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch trend";
      set({ error: errorMsg, isLoading: false });
    }
  },

  checkIn: async (employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await attendanceService.checkIn(employeeId);
      set({ isLoading: false });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Check-in failed";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  checkOut: async (employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await attendanceService.checkOut(employeeId);
      set({ isLoading: false });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Check-out failed";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
