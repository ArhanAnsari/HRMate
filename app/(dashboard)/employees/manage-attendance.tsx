/**
 * 🛡️ ADMIN MANAGE ATTENDANCE PANEL
 */

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { appwriteClient } from "@/src/services/appwrite";
import { employeeQueries } from "@/src/services/appwriteClient";
import { AttendanceRecord, attendanceService } from "@/src/services/attendance.service";
import { useAuthStore } from "@/src/state/auth.store";
import { useUIStore } from "@/src/state/ui.store"; // 👈 Added UI Store import
import { useColorScheme } from "../../../hooks/use-color-scheme"; // 👈 Added core hook import
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ManagedEmployee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: "present" | "absent" | "late" | "unlogged";
  checkIn?: string;
  checkOut?: string;
}

export default function ManageAttendanceScreen() {
  const colorScheme = useColorScheme(); // 👈 Fixed hook assignment
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { user } = useAuthStore();
  const { showToast } = useUIStore(); // 👈 Destructured showToast method

  const [employees, setEmployees] = useState<ManagedEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<ManagedEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const loadManagementData = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const [rawStaff, todayRecords] = await Promise.all([
        employeeQueries.getEmployees(user.companyId),
        attendanceService.getTodayRecords(user.companyId),
      ]);

      const mappedStaff: ManagedEmployee[] = rawStaff.map((staff: any) => {
        const attendanceLog = todayRecords.find((r) => r.employeeId === staff.id);
        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          position: staff.position,
          department: staff.department,
          status: attendanceLog ? (attendanceLog.status as any) : "unlogged",
          checkIn: attendanceLog?.checkIn,
          checkOut: attendanceLog?.checkOut,
        };
      });

      setEmployees(mappedStaff);
    } catch (error) {
      console.error("Error linking system metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    if (user?.companyId) {
      loadManagementData();

      const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.ATTENDANCE}.documents`;
      const unsubscribe = appwriteClient.subscribe(channel, () => {
        loadManagementData();
      });
      return () => unsubscribe();
    }
  }, [loadManagementData, user?.companyId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      setFilteredEmployees(
        employees.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, employees]);

  const handleUpdateStatus = async (employee: ManagedEmployee, newStatus: "present" | "absent" | "late") => {
    if (!user?.companyId) return;
    setUpdatingId(employee.id);
    try {
      await attendanceService.overrideIndividualAttendance(
        user.companyId,
        employee.id,
        employee.name,
        employee.email,
        newStatus
      );
      showToast("Status updated successfully", "success");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to alter employee status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkMark = async (status: "present" | "absent" | "late") => {
    if (!user?.companyId) return;
    Alert.alert(
      "Bulk Process Operation",
      `Are you sure you want to batch mark remaining staff as ${status}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Execute",
          onPress: async () => {
            setIsBulkProcessing(true);
            try {
              await attendanceService.bulkMarkAll(user.companyId!, status);
              Alert.alert("Success", "Bulk log initialized successfully!");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setIsBulkProcessing(false);
            }
          },
        },
      ]
    );
  };

  const themeStyles = isDark ? THEME.dark : THEME.light;

  const renderStaffRow = ({ item, index }: { item: ManagedEmployee; index: number }) => {
    const statuses: Array<"present" | "late" | "absent"> = ["present", "late", "absent"];
    const statusColors = { present: "#10B981", late: "#F59E0B", absent: "#EF4444", unlogged: "#94A3B8" };

    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1, marginRight: THEME.spacing.sm }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: themeStyles.text.primary }}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: themeStyles.text.secondary }}>{item.position} • {item.department}</Text>
              {item.checkIn && (
                <Text style={{ fontSize: 11, color: THEME.colors.primary, marginTop: 4 }}>
                  Logged Time: {item.checkIn} {item.checkOut ? `- ${item.checkOut}` : ""}
                </Text>
              )}
            </View>
            <View style={{ backgroundColor: statusColors[item.status] + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: statusColors[item.status], fontSize: 11, fontWeight: "700", textTransform: "uppercase" }}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: THEME.spacing.sm, marginTop: THEME.spacing.md, borderTopWidth: 1, borderTopColor: themeStyles.border, paddingTop: THEME.spacing.sm }}>
            {statuses.map((s) => {
              const isSelected = item.status === s;
              return (
                <TouchableOpacity
                  key={s}
                  disabled={updatingId === item.id}
                  onPress={() => handleUpdateStatus(item, s)}
                  style={{
                    flex: 1,
                    paddingVertical: 6,
                    borderRadius: THEME.borderRadius.md,
                    alignItems: "center",
                    backgroundColor: isSelected ? statusColors[s] : (isDark ? THEME.colors.dark.backgroundTertiary : "#f1f5f9"),
                  }}
                >
                  {updatingId === item.id && isSelected ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={{ fontSize: 11, fontWeight: "600", color: isSelected ? "#fff" : themeStyles.text.secondary, textTransform: "capitalize" }}>
                      {s}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </PremiumCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: THEME.spacing.lg, paddingVertical: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: themeStyles.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: THEME.spacing.md }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeStyles.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "700", color: themeStyles.text.primary }}>Staff Roster Panel</Text>
          <Text style={{ fontSize: 12, color: themeStyles.text.secondary }}>Modify and track individual statuses live</Text>
        </View>
      </View>

      <FlatList
        data={filteredEmployees}
        renderItem={renderStaffRow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: THEME.spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadManagementData} />}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: THEME.spacing.md }}>
            <View style={{ flexDirection: "row", gap: THEME.spacing.md, marginBottom: THEME.spacing.lg, backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt, padding: THEME.spacing.md, borderRadius: THEME.borderRadius.lg, borderWidth: 1, borderColor: themeStyles.border }}>
              <TouchableOpacity disabled={isBulkProcessing || loading} onPress={() => handleBulkMark("present")} style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: THEME.colors.successLight, paddingVertical: THEME.spacing.sm, borderRadius: THEME.borderRadius.md, borderWidth: 1, borderColor: THEME.colors.success }}>
                <MaterialCommunityIcons name="check-all" size={16} color={THEME.colors.success} style={{ marginRight: 6 }} />
                <Text style={{ color: THEME.colors.success, fontWeight: "700", fontSize: 12 }}>All Present</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={isBulkProcessing || loading} onPress={() => handleBulkMark("absent")} style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", backgroundColor: THEME.colors.dangerLight, paddingVertical: THEME.spacing.sm, borderRadius: THEME.borderRadius.md, borderWidth: 1, borderColor: THEME.colors.danger }}>
                <MaterialCommunityIcons name="close-circle-outline" size={16} color={THEME.colors.danger} style={{ marginRight: 6 }} />
                <Text style={{ color: THEME.colors.danger, fontWeight: "700", fontSize: 12 }}>All Absent</Text>
              </TouchableOpacity>
            </View>

            <SearchBar placeholder="Filter staff name..." value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        )}
        ListEmptyComponent={() => !loading ? <Text style={{ textAlign: "center", color: themeStyles.text.tertiary, marginTop: THEME.spacing.xl }}>No staff records matching query</Text> : <SkeletonLoader type="list" count={4} />}
      />
    </SafeAreaView>
  );
}