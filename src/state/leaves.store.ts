import { create } from "zustand";
import { leavesService } from "../services/leaves.service";
import { LeaveCreateInput, LeaveRequest } from "../types";

interface LeaveBalance {
  total: number;
  used: number;
  remaining: number;
}

interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
}

interface LeavesStore {
  myLeaves: LeaveRequest[];
  pendingLeaves: LeaveRequest[];
  balance: LeaveBalance | null;
  stats: LeaveStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  applyLeave: (
    companyId: string,
    employeeId: string,
    data: LeaveCreateInput,
  ) => Promise<void>;
  fetchMyLeaves: (companyId: string, employeeId: string) => Promise<void>;
  fetchLeaveBalance: (companyId: string, employeeId: string) => Promise<void>;
  fetchPendingLeaves: (companyId: string) => Promise<void>;
  fetchLeaveStats: (companyId: string) => Promise<void>;
  approveLeave: (
    leaveId: string,
    approverUserId: string,
    notes?: string,
  ) => Promise<void>;
  rejectLeave: (
    leaveId: string,
    approverUserId: string,
    reason: string,
  ) => Promise<void>;
  clearError: () => void;
}

export const useLeavesStore = create<LeavesStore>((set, get) => ({
  myLeaves: [],
  pendingLeaves: [],
  balance: null,
  stats: null,
  isLoading: false,
  error: null,

  applyLeave: async (
    companyId: string,
    employeeId: string,
    data: LeaveCreateInput,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newLeave = await leavesService.applyLeave(
        companyId,
        employeeId,
        data,
      );
      const { myLeaves } = get();
      set({ myLeaves: [newLeave, ...myLeaves], isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to apply leave";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchMyLeaves: async (companyId: string, employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const leaves = await leavesService.getEmployeeLeaves(
        companyId,
        employeeId,
      );
      set({ myLeaves: leaves, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch leaves";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchLeaveBalance: async (companyId: string, employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const balance = await leavesService.getLeaveBalance(
        companyId,
        employeeId,
      );
      set({ balance, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch balance";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchPendingLeaves: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const leaves = await leavesService.getPendingLeaves(companyId);
      set({ pendingLeaves: leaves, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch pending leaves";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchLeaveStats: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await leavesService.getLeaveStats(companyId);
      set({ stats, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch stats";
      set({ error: errorMsg, isLoading: false });
    }
  },

  approveLeave: async (leaveId: string, approverUserId: string, notes = "") => {
    set({ isLoading: true, error: null });
    try {
      const updatedLeave = await leavesService.approveLeave(
        leaveId,
        approverUserId,
        notes,
      );
      const { pendingLeaves } = get();
      set({
        pendingLeaves: pendingLeaves.filter((l) => l.$id !== leaveId),
        isLoading: false,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to approve leave";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  rejectLeave: async (
    leaveId: string,
    approverUserId: string,
    reason: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      await leavesService.rejectLeave(leaveId, approverUserId, reason);
      const { pendingLeaves } = get();
      set({
        pendingLeaves: pendingLeaves.filter((l) => l.$id !== leaveId),
        isLoading: false,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to reject leave";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
