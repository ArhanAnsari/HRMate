/**
 * 🎨 NEW PREMIUM DASHBOARD NAVIGATION LAYOUT
 * 8-Tab structure with bottom navigation and premium styling
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? THEME.dark : THEME.light;

  // Tab configuration with icons and labels
  const tabConfig = [
    {
      name: "index",
      title: "Dashboard",
      icon: "view-dashboard-outline",
    },
    {
      name: "employees",
      title: "Employees",
      icon: "account-multiple-outline",
    },
    {
      name: "attendance",
      title: "Attendance",
      icon: "calendar-check-outline",
    },
    {
      name: "payroll",
      title: "Payroll",
      icon: "cash-multiple",
    },
    {
      name: "leaves",
      title: "Leaves",
      icon: "calendar-plus-outline",
    },
    {
      name: "insights",
      title: "Insights",
      icon: "chart-line",
    },
    {
      name: "chat",
      title: "AI",
      icon: "robot-happy-outline",
    },
    {
      name: "settings",
      title: "More",
      icon: "menu",
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
          paddingTop: 8,
          elevation: 0,
          shadowColor: "transparent",
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 4,
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
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={24}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
            tabBarLabel: ({ focused, color }) => (
              <Text
                style={{
                  color,
                  fontSize: 10,
                  fontWeight: "500",
                  marginTop: 2,
                  opacity: focused ? 1 : 0.6,
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
    </Tabs>
  );
}
