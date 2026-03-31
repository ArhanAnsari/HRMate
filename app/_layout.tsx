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
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://a3bdbcce0bbdeb0c9322f4abe4a160b2@o4508228539645952.ingest.us.sentry.io/4511138640429056',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
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
});
