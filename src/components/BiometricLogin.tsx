/**
 * 🔐 BIOMETRIC LOGIN COMPONENT
 * Biometric authentication UI for fingerprint and Face ID
 */

import BiometricAuthService from "@/src/services/biometric.service";
import { useBiometricStore } from "@/src/state/biometric.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface BiometricLoginProps {
  enabled: boolean;
  onAuthenticate: () => Promise<void>;
  loading?: boolean;
}

export const BiometricLogin: React.FC<BiometricLoginProps> = ({
  enabled,
  onAuthenticate,
  loading = false,
}) => {
  const [biometricType, setBiometricType] = useState<
    "fingerprint" | "face" | null
  >(null);
  const { setBiometricType: storeSetType } = useBiometricStore();

  useEffect(() => {
    const detectBiometric = async () => {
      if (!enabled) return;

      const types = await BiometricAuthService.enrolledBiometricsAvailable();
      if (types.length > 0) {
        const type = types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
          ? "face"
          : "fingerprint";
        setBiometricType(type);
        storeSetType(type);
      }
    };

    detectBiometric();
  }, [enabled]);

  const handleBiometricAuth = async () => {
    try {
      const authenticated = await BiometricAuthService.authenticate();
      if (authenticated) {
        await onAuthenticate();
      }
    } catch (error) {
      console.error("Biometric auth failed:", error);
    }
  };

  if (!enabled || !biometricType) return null;

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      marginVertical: THEME.spacing.md,
    },
    button: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: THEME.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      marginTop: THEME.spacing.sm,
      fontSize: 12,
      fontWeight: "600",
      color: THEME.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleBiometricAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <MaterialCommunityIcons
            name={biometricType === "face" ? "face-recognition" : "fingerprint"}
            size={28}
            color="#fff"
          />
        )}
      </TouchableOpacity>
      <Text style={styles.label}>
        {biometricType === "face" ? "Face ID" : "Fingerprint"}
      </Text>
    </View>
  );
};

export default BiometricLogin;
