/**
 * 📊 ACTIVITY LOG SERVICE
 * Audit trail and activity tracking for HR operations
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ActivityAction =
  | "employee_added"
  | "employee_updated"
  | "employee_deleted"
  | "attendance_marked"
  | "leave_requested"
  | "leave_approved"
  | "leave_rejected"
  | "payroll_generated"
  | "payroll_processed"
  | "settings_changed"
  | "login"
  | "logout";

export interface ActivityLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: ActivityAction;
  resource: string;
  description: string;
  metadata?: Record<string, any>;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

interface ActivityLogsState {
  logs: ActivityLog[];

  // Actions
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  getLogs: (limit?: number) => ActivityLog[];
  getLogsByUser: (userId: string, limit?: number) => ActivityLog[];
  getLogsByAction: (action: ActivityAction, limit?: number) => ActivityLog[];
  getLogsByResource: (resource: string, limit?: number) => ActivityLog[];
  clearOldLogs: (daysToKeep?: number) => void;
  exportLogs: (format: "json" | "csv") => string;
}

export const useActivityLogsStore = create<ActivityLogsState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (log) =>
        set((state) => {
          const newLog: ActivityLog = {
            ...log,
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
          };
          return {
            logs: [newLog, ...state.logs],
          };
        }),

      getLogs: (limit = 100) => {
        const state = get();
        return state.logs.slice(0, limit);
      },

      getLogsByUser: (userId, limit = 100) => {
        const state = get();
        return state.logs
          .filter((log) => log.userId === userId)
          .slice(0, limit);
      },

      getLogsByAction: (action, limit = 100) => {
        const state = get();
        return state.logs
          .filter((log) => log.action === action)
          .slice(0, limit);
      },

      getLogsByResource: (resource, limit = 100) => {
        const state = get();
        return state.logs
          .filter((log) => log.resource === resource)
          .slice(0, limit);
      },

      clearOldLogs: (daysToKeep = 90) => {
        const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
        set((state) => ({
          logs: state.logs.filter((log) => log.timestamp > cutoffTime),
        }));
      },

      exportLogs: (format = "json") => {
        const state = get();
        if (format === "json") {
          return JSON.stringify(state.logs, null, 2);
        } else if (format === "csv") {
          const headers = [
            "Timestamp",
            "User",
            "Action",
            "Resource",
            "Description",
          ];
          const rows = state.logs.map((log) => [
            new Date(log.timestamp).toISOString(),
            log.userName,
            log.action,
            log.resource,
            log.description,
          ]);
          return [headers, ...rows]
            .map((row) =>
              row
                .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                .join(","),
            )
            .join("\n");
        }
        return "";
      },
    }),
    {
      name: "activity-logs-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export class ActivityLogsService {
  static logEmployeeAdded(
    userId: string,
    userName: string,
    employeeId: string,
    employeeName: string,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "employee_added",
      resource: `employee:${employeeId}`,
      description: `Added new employee: ${employeeName}`,
    });
  }

  static logEmployeeUpdated(
    userId: string,
    userName: string,
    employeeId: string,
    changes: Record<string, any>,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "employee_updated",
      resource: `employee:${employeeId}`,
      description: `Updated employee information`,
      changes,
    });
  }

  static logAttendanceMarked(
    userId: string,
    userName: string,
    employeeId: string,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "attendance_marked",
      resource: `attendance:${employeeId}`,
      description: `Marked attendance for employee`,
    });
  }

  static logLeaveApproved(
    userId: string,
    userName: string,
    leaveId: string,
    employeeName: string,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "leave_approved",
      resource: `leave:${leaveId}`,
      description: `Approved leave request for ${employeeName}`,
    });
  }

  static logLeaveRejected(
    userId: string,
    userName: string,
    leaveId: string,
    employeeName: string,
    reason?: string,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "leave_rejected",
      resource: `leave:${leaveId}`,
      description: `Rejected leave request for ${employeeName}`,
      metadata: { reason },
    });
  }

  static logPayrollProcessed(
    userId: string,
    userName: string,
    month: string,
    count: number,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "payroll_processed",
      resource: `payroll:${month}`,
      description: `Processed payroll for ${count} employees`,
      metadata: { employeeCount: count },
    });
  }

  static logLogin(userId: string, userName: string) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "login",
      resource: "auth",
      description: `User logged in`,
    });
  }

  static logLogout(userId: string, userName: string) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "logout",
      resource: "auth",
      description: `User logged out`,
    });
  }

  static logSettingsChanged(
    userId: string,
    userName: string,
    setting: string,
    oldValue: any,
    newValue: any,
  ) {
    useActivityLogsStore.getState().addLog({
      userId,
      userName,
      action: "settings_changed",
      resource: `settings:${setting}`,
      description: `Changed ${setting} setting`,
      changes: {
        before: { [setting]: oldValue },
        after: { [setting]: newValue },
      },
    });
  }
}

export default ActivityLogsService;
