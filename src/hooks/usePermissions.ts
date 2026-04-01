/**
 * 🔒 PERMISSIONS HOOK
 * Wrapper around the permissions matrix for easy UI state checks.
 */

import { useAuthStore } from "@/src/state/auth.store";
import { Action, hasPermission } from "@/src/utils/permissions";

export const usePermissions = () => {
  const { user } = useAuthStore();

  const can = (action: Action) => {
    if (!user) return false;
    return hasPermission(user.role, action);
  };

  return { can, role: user?.role, user };
};
