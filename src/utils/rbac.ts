/**
 * 🔐 Role-Based Access Control (RBAC) System
 * Conditional UI rendering based on user roles
 */

import { useAuthStore } from "@/src/state/auth.store";
import React, { ReactNode } from "react";

export type UserRole = "admin" | "manager" | "employee";

interface RolePermission {
  canViewEmployees: boolean;
  canManageEmployees: boolean;
  canApproveLeaves: boolean;
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  canViewTeamInsights: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canViewActivityLogs: boolean;
  canBulkImport: boolean;
}

/**
 * Get permissions based on user role
 */
export const getRolePermissions = (role: UserRole): RolePermission => {
  const permissions: Record<UserRole, RolePermission> = {
    admin: {
      canViewEmployees: true,
      canManageEmployees: true,
      canApproveLeaves: true,
      canViewPayroll: true,
      canManagePayroll: true,
      canViewTeamInsights: true,
      canExportData: true,
      canManageSettings: true,
      canViewActivityLogs: true,
      canBulkImport: true,
    },
    manager: {
      canViewEmployees: true,
      canManageEmployees: false,
      canApproveLeaves: true,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewTeamInsights: true,
      canExportData: true,
      canManageSettings: false,
      canViewActivityLogs: false,
      canBulkImport: false,
    },
    employee: {
      canViewEmployees: false,
      canManageEmployees: false,
      canApproveLeaves: false,
      canViewPayroll: false,
      canManagePayroll: false,
      canViewTeamInsights: false,
      canExportData: false,
      canManageSettings: true,
      canViewActivityLogs: false,
      canBulkImport: false,
    },
  };

  return permissions[role] || permissions.employee;
};

/**
 * Hook to check if user has permission
 */
export const usePermission = (permission: keyof RolePermission): boolean => {
  const { user } = useAuthStore();

  if (!user) return false;

  const permissions = getRolePermissions(user.role);
  return permissions[permission] || false;
};

/**
 * Component to conditionally render based on permission
 */
interface PermissionGateProps {
  permission: keyof RolePermission;
  fallback?: ReactNode;
  children: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return fallback as React.ReactElement;
  }

  return children as React.ReactElement;
};

/**
 * Hook to get user's role
 */
export const useUserRole = (): UserRole => {
  const { user } = useAuthStore();
  return user?.role || "employee";
};

/**
 * Utility to check if user has specific role
 */
export const useHasRole = (role: UserRole | UserRole[]): boolean => {
  const userRole = useUserRole();

  if (Array.isArray(role)) {
    return role.includes(userRole);
  }

  return userRole === role;
};
