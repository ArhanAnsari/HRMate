/**
 * 🏢 useCompanyId Hook
 * Safe way to get company ID from auth store
 * Handles loading and error states
 */

import { useAuthStore } from "@/src/state/auth.store";
import { useEffect, useState } from "react";

interface UseCompanyIdResult {
  companyId: string | null;
  loading: boolean;
  error: string | null;
}

export const useCompanyId = (): UseCompanyIdResult => {
  const { user } = useAuthStore();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    if (user.companyId) {
      setCompanyId(user.companyId);
      setError(null);
      setLoading(false);
    } else {
      setError("Company ID not found in user profile");
      setLoading(false);
    }
  }, [user]);

  return { companyId, loading, error };
};

/**
 * Get company ID synchronously (use only in event handlers)
 */
export const getCompanyIdSync = (): string | null => {
  const { user } = useAuthStore.getState();
  return user?.companyId || null;
};
