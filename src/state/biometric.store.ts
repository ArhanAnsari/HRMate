/**
 * 🔐 BIOMETRIC AUTH STORE - Zustand State Management
 * Handles biometric login, settings, and secure storage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BiometricState {
  biometricEnabled: boolean;
  biometricType: "fingerprint" | "face" | null;
  usingBiometric: boolean;
  lastBiometricAttempt: number | null;
  failedAttempts: number;

  // Actions
  setBiometricEnabled: (enabled: boolean) => void;
  setBiometricType: (type: "fingerprint" | "face" | null) => void;
  setUsingBiometric: (using: boolean) => void;
  recordBiometricAttempt: () => void;
  resetFailedAttempts: () => void;
  incrementFailedAttempts: () => void;
}

export const useBiometricStore = create<BiometricState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      biometricType: null,
      usingBiometric: false,
      lastBiometricAttempt: null,
      failedAttempts: 0,

      setBiometricEnabled: (enabled) =>
        set(() => ({ biometricEnabled: enabled })),

      setBiometricType: (type) => set(() => ({ biometricType: type })),

      setUsingBiometric: (using) => set(() => ({ usingBiometric: using })),

      recordBiometricAttempt: () =>
        set(() => ({
          lastBiometricAttempt: Date.now(),
          failedAttempts: 0,
        })),

      resetFailedAttempts: () => set(() => ({ failedAttempts: 0 })),

      incrementFailedAttempts: () =>
        set((state) => ({
          failedAttempts: state.failedAttempts + 1,
        })),
    }),
    {
      name: "biometric-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useBiometricStore;
