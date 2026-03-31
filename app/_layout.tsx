import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import ErrorBoundary from "@/src/components/ErrorBoundary";
import OfflineIndicator from "@/src/components/OfflineIndicator";
import { useAuthStore } from "@/src/state/auth.store";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const initializeAuth = async () => {
      await checkAuth();
      setAppReady(true);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!appReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inDashboardGroup = segments[0] === "(dashboard)";

    if (isAuthenticated && !inDashboardGroup) {
      router.replace("/(dashboard)");
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    }
  }, [appReady, isAuthenticated, segments, router]);

  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <OfflineIndicator />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
