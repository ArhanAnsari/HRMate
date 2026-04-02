/**
 * 🎨 NEW PREMIUM DASHBOARD NAVIGATION LAYOUT
 * 8-Tab structure with bottom navigation and premium styling
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

import { usePermissions } from "@/src/hooks/usePermissions";
import { Action } from "@/src/utils/permissions";

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? THEME.dark : THEME.light;
  const { can } = usePermissions();

  // Tab configuration with icons and labels
  const tabConfig = [
    {
      name: "index",
      title: "Home",
      icon: "home-outline",
    },
    {
      name: "employees",
      title: "Team",
      icon: "account-group-outline",
      hidden: !can(Action.VIEW_ALL_EMPLOYEES),
    },
    {
      name: "attendance",
      title: "Time",
      icon: "clock-outline",
    },
    {
      name: "payroll",
      title: "Pay",
      icon: "wallet-outline",
      hidden: true,
    },
    {
      name: "chat",
      title: "AI Chat",
      icon: "robot-outline",
    },
    {
      name: "leaves",
      title: "Leaves",
      icon: "calendar-plus-outline",
      hidden: true,
    },
    {
      name: "insights",
      title: "Insights",
      icon: "chart-line",
      hidden: true,
    },
    {
      name: "settings",
      title: "Settings",
      icon: "cog-outline",
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: isDark
          ? THEME.colors.dark.textTertiary
          : THEME.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: isDark
            ? THEME.colors.dark.background
            : THEME.colors.background.main,
          borderTopWidth: 1,
          borderTopColor: isDark
            ? THEME.colors.dark.border
            : THEME.colors.border,
          height: THEME.componentSizes.tabBar,
          paddingBottom: 8,
          paddingTop: 4,
          // Premium shadow above the tab bar
          shadowColor: isDark ? "#000000" : THEME.colors.shadowDark,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 0,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      {tabConfig.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            href: tab.hidden ? null : undefined,
            tabBarIcon: ({ color, focused }) => (
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                {/* Pill background for active tab */}
                <View
                  style={{
                    backgroundColor: focused
                      ? `${THEME.colors.primary}18`
                      : "transparent",
                    borderRadius: THEME.borderRadius.lg,
                    paddingHorizontal: THEME.spacing.md,
                    paddingVertical: THEME.spacing.xs,
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={tab.icon as any}
                    size={22}
                    color={color}
                  />
                </View>
                {/* Active dot indicator */}
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: THEME.colors.primary,
                      marginTop: 2,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: 10,
                  fontWeight: focused ? "700" : "500",
                  opacity: focused ? 1 : 0.65,
                }}
              >
                {tab.title}
              </Text>
            ),
          }}
        />
      ))}

      {/* Hidden routes */}
      <Tabs.Screen
        name="employees/add"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="employees/[id]"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="employees/bulk-import"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="profile"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="payslips"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="bulk-import"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
      <Tabs.Screen
        name="attendance_new"
        options={{ href: null, tabBarStyle: { display: "none" } }}
      />
    </Tabs>
  );
}
