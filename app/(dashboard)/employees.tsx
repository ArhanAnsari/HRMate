/**
 * 👥 PREMIUM EMPLOYEES SCREEN - Manager View
 * Search, filters, employee cards with modern layout
 * Backed by real Appwrite data
 */

import { EmptyState } from "@/src/components/ui/EmptyState";
import { FAB } from "@/src/components/ui/FAB";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { employeeQueries } from "@/src/services/appwriteClient";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EmployeeItem {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "on_leave";
}

const FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on_leave" },
  { label: "Inactive", value: "inactive" },
];

export default function EmployeesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEmployees = useCallback(async () => {
    if (!user?.companyId) return;
    try {
      setError("");
      const data = await employeeQueries.getEmployees(user.companyId);
      setEmployees(data as unknown as EmployeeItem[]);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      (selectedFilter === "all" || emp.status === selectedFilter) &&
      (emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchText.toLowerCase())),
  );

  // Style definitions
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const headerStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  };

  const headerTitleStyle: TextStyle = {
    fontSize: THEME.typography.h3.fontSize,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
  };

  const filterContainerStyle: ViewStyle = {
    flexDirection: "row",
    gap: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.lg,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
    paddingBottom: THEME.spacing.md,
  };

  const filterChipStyle: ViewStyle = {
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? THEME.dark.border : THEME.light.border,
  };

  const filterChipActiveStyle: ViewStyle = {
    ...filterChipStyle,
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  };

  const filterChipTextStyle: TextStyle = {
    fontSize: THEME.typography.label.fontSize,
    fontWeight: "500",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
  };

  const filterChipTextActiveStyle: TextStyle = {
    color: "#FFFFFF",
  };

  const listContainerStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
  };

  const employeeCardStyle: ViewStyle = {
    marginBottom: THEME.spacing.md,
  };

  const employeeCardContentStyle: ViewStyle = {
    flexDirection: "row",
    gap: THEME.spacing.md,
    alignItems: "center",
  };

  const avatarStyle: ViewStyle = {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  };

  const avatarTextStyle: TextStyle = {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  };

  const employeeInfoStyle: ViewStyle = {
    flex: 1,
  };

  const employeeNameStyle: TextStyle = {
    fontSize: THEME.typography.h6.fontSize,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.xs,
  };

  const employeeRoleStyle: TextStyle = {
    fontSize: THEME.typography.bodySm.fontSize,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    marginBottom: THEME.spacing.xs,
  };

  const employeeDeptStyle: TextStyle = {
    fontSize: THEME.typography.caption.fontSize,
    color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary,
  };

  const employeeFooterStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.md,
  };

  const statusBadgeStyle: ViewStyle = {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  };

  const statusBadgeTextStyle: TextStyle = {
    fontSize: THEME.typography.caption.fontSize,
    fontWeight: "600",
    color: "#FFFFFF",
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return THEME.colors.success;
      case "on_leave":
        return THEME.colors.warning;
      case "inactive":
        return THEME.colors.danger;
      default:
        return THEME.colors.info;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "active":
        return "Active";
      case "on_leave":
        return "On Leave";
      case "inactive":
        return "Inactive";
      default:
        return status;
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const renderEmployeeCard = ({ item }: { item: EmployeeItem }) => (
    <PremiumCard
      interactive
      onPress={() => router.push(`/(dashboard)/employees/${item.id}`)}
      style={employeeCardStyle}
    >
      <View style={employeeCardContentStyle}>
        <View style={avatarStyle}>
          <Text style={avatarTextStyle}>{getInitials(item.name)}</Text>
        </View>

        <View style={employeeInfoStyle}>
          <Text style={employeeNameStyle}>{item.name}</Text>
          <Text style={employeeRoleStyle}>{item.position}</Text>
          <Text style={employeeDeptStyle}>{item.department}</Text>
        </View>

        <Pressable
          style={{ padding: THEME.spacing.sm }}
          onPress={() => router.push(`/(dashboard)/employees/${item.id}`)}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
          />
        </Pressable>
      </View>

      <View style={employeeFooterStyle}>
        <View
          style={[
            statusBadgeStyle,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={statusBadgeTextStyle}>
            {getStatusLabel(item.status)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: THEME.spacing.sm, flex: 1 }}>
          <MaterialCommunityIcons
            name="email-outline"
            size={16}
            color={
              isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
            }
          />
          <Text
            style={{
              fontSize: 12,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item.email}
          </Text>
        </View>
      </View>
    </PremiumCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={headerStyle}>
          <Text style={headerTitleStyle}>Employees</Text>
        </View>
        <View style={{ paddingHorizontal: THEME.spacing.lg }}>
          <SkeletonLoader type="card" count={4} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <View style={headerStyle}>
        <Text style={headerTitleStyle}>Employees ({employees.length})</Text>
        <SearchBar
          placeholder="Search employees..."
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={() => {}}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={filterContainerStyle}
      >
        {FILTER_OPTIONS.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => setSelectedFilter(filter.value)}
            style={[
              filterChipStyle,
              selectedFilter === filter.value && filterChipActiveStyle,
            ]}
          >
            <Text
              style={[
                filterChipTextStyle,
                selectedFilter === filter.value && filterChipTextActiveStyle,
              ]}
            >
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {error ? (
        <View
          style={{
            paddingHorizontal: THEME.spacing.lg,
            paddingBottom: THEME.spacing.md,
          }}
        >
          <Text style={{ color: THEME.colors.danger, fontSize: 14 }}>
            {error}
          </Text>
        </View>
      ) : null}

      {/* Employee List */}
      {filteredEmployees.length > 0 ? (
        <FlatList
          data={filteredEmployees}
          renderItem={renderEmployeeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={listContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={THEME.colors.primary}
            />
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon="account-search-outline"
            title="No Employees Found"
            description={
              searchText
                ? `No employees match "${searchText}"`
                : "Add your first employee to get started"
            }
            action={
              !searchText
                ? {
                    label: "+ Add Employee",
                    onPress: () => router.push("/(dashboard)/employees/add"),
                  }
                : undefined
            }
          />
        </View>
      )}

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        onPress={() => router.push("/(dashboard)/employees/add")}
        options={[
          {
            icon: "account-plus",
            label: "Add Employee",
            onPress: () => router.push("/(dashboard)/employees/add"),
          },
          {
            icon: "upload",
            label: "Bulk Import",
            onPress: () => router.push("/(dashboard)/employees/bulk-import"),
          },
        ]}
        position="bottom-right"
      />
    </SafeAreaView>
  );
}
