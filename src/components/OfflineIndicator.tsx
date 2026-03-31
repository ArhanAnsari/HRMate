/**
 * 📡 OFFLINE INDICATOR COMPONENT
 * Shows network status and sync state
 */

import {
    initializeNetworkListener,
    useOfflineStore,
} from "@/src/state/offline.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, useColorScheme } from "react-native";

export const OfflineIndicator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isOnline, syncInProgress, syncQueue } = useOfflineStore();
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const unsubscribe = initializeNetworkListener();
    return unsubscribe;
  }, []);

  // Auto-hide when online and no pending sync
  useEffect(() => {
    if (isOnline && !syncInProgress && syncQueue.length === 0) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, syncInProgress, syncQueue.length]);

  if (isOnline && !syncInProgress && syncQueue.length === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isOnline ? THEME.colors.warning : THEME.colors.danger,
      paddingVertical: THEME.spacing.sm,
      paddingHorizontal: THEME.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
      marginLeft: THEME.spacing.xs,
    },
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <MaterialCommunityIcons
        name={isOnline ? "wifi-alert" : "wifi-off"}
        size={16}
        color="#fff"
      />
      <Text style={styles.text}>
        {isOnline
          ? syncInProgress
            ? `Syncing ${syncQueue.length} changes...`
            : `${syncQueue.length} pending changes`
          : "You are offline"}
      </Text>
    </Animated.View>
  );
};

export default OfflineIndicator;
