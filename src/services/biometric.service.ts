/**
 * 🔐 BIOMETRIC AUTHENTICATION SERVICE
 * Handles fingerprint and Face ID authentication
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch {
      return false;
    }
  }

  static async enrolledBiometricsAvailable(): Promise<
    LocalAuthentication.AuthenticationType[]
  > {
    try {
      const types: LocalAuthentication.AuthenticationType[] = [];

      const fingerprint = await LocalAuthentication.isEnrolledAsync();
      if (fingerprint)
        types.push(LocalAuthentication.AuthenticationType.FINGERPRINT);

      const facial = await LocalAuthentication.isEnrolledAsync();
      if (facial)
        types.push(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      return types;
    } catch {
      return [];
    }
  }

  static async authenticate(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        fallbackLabel: "Use passcode",
      });

      return result.success;
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return false;
    }
  }

  static async saveBiometricCredentials(email: string, password: string) {
    try {
      await AsyncStorage.setItem(
        `@hrmate_biometric_${email}`,
        JSON.stringify({ email, password, timestamp: Date.now() }),
      );
      return true;
    } catch {
      return false;
    }
  }

  static async retrieveBiometricCredentials(email: string) {
    try {
      const stored = await AsyncStorage.getItem(`@hrmate_biometric_${email}`);
      if (stored) {
        const credentials = JSON.parse(stored);
        // Only return if stored less than 7 days ago
        if (Date.now() - credentials.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return credentials;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  static async clearBiometricCredentials(email: string) {
    try {
      await AsyncStorage.removeItem(`@hrmate_biometric_${email}`);
      return true;
    } catch {
      return false;
    }
  }

  static async clearAllBiometricCredentials() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const biometricKeys = keys.filter((key) =>
        key.startsWith("@hrmate_biometric_"),
      );
      await AsyncStorage.multiRemove(biometricKeys);
      return true;
    } catch {
      return false;
    }
  }
}

export default BiometricAuthService;
