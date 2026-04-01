/**
 * 🔒 PERMISSIONS MATRIX - Access Control Logic
 * Granular definitions for what each User Role can do.
 * Maps 'admin' | 'manager' | 'employee' to specific actions.
 */

import { UserRole } from "@/src/types/auth.types";

// Granular actions an authenticated user can perform
export enum Action {
  // Employees
  VIEW_ALL_EMPLOYEES,
  ADD_EMPLOYEE,
  EDIT_EMPLOYEE,
  DELETE_EMPLOYEE,

  // Attendance
  VIEW_ALL_ATTENDANCE,
  EDIT_ATTENDANCE,
  APPROVE_ATTENDANCE_CORRECTION,

  // Leaves
  VIEW_ALL_LEAVES,
  APPROVE_LEAVES,

  // Payroll
  VIEW_ALL_PAYROLL,
  PROCESS_PAYROLL,

  // General / Admin
  VIEW_DASHBOARD_ANALYTICS,
  MANAGE_COMPANY_SETTINGS,
  SWITCH_WORKSPACE,
  SEND_COMPANY_ANNOUNCEMENTS,
}

// Master Permissions Matrix Configuration
export const PERMISSIONS_MATRIX: Record<UserRole, Action[]> = {
  admin: [
    Action.VIEW_ALL_EMPLOYEES,
    Action.ADD_EMPLOYEE,
    Action.EDIT_EMPLOYEE,
    Action.DELETE_EMPLOYEE,
    Action.VIEW_ALL_ATTENDANCE,
    Action.EDIT_ATTENDANCE,
    Action.APPROVE_ATTENDANCE_CORRECTION,
    Action.VIEW_ALL_LEAVES,
    Action.APPROVE_LEAVES,
    Action.VIEW_ALL_PAYROLL,
    Action.PROCESS_PAYROLL,
    Action.VIEW_DASHBOARD_ANALYTICS,
    Action.MANAGE_COMPANY_SETTINGS,
    Action.SWITCH_WORKSPACE,
    Action.SEND_COMPANY_ANNOUNCEMENTS,
  ],
  manager: [
    Action.VIEW_ALL_EMPLOYEES,
    Action.VIEW_ALL_ATTENDANCE,
    Action.APPROVE_ATTENDANCE_CORRECTION,
    Action.VIEW_ALL_LEAVES,
    Action.APPROVE_LEAVES,
    Action.VIEW_DASHBOARD_ANALYTICS,
  ],
  employee: [
    // Employees have very restricted actions
    // Generally allowed to manage their own specific data only, enforced via DB rules / backend
  ],
};

export const hasPermission = (
  role: UserRole | undefined,
  action: Action,
): boolean => {
  if (!role) return false;
  return PERMISSIONS_MATRIX[role].includes(action);
};
