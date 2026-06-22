/**
 * 📊 ATTENDANCE SCREEN - Personal View with Admin Navigation Launcher
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { appwriteClient } from "@/src/services/appwrite";
import { AttendanceRecord, AttendanceStats, attendanceService } from "@/src/services/attendance.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const loadAttendanceData = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    try {
      const [todayStats, todayRecords] = await Promise.all([
        attendanceService.getTodayStats(user.companyId),
        attendanceService.getTodayRecords(user.companyId),
      ]);
      setStats(todayStats);
      setRecords(todayRecords);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  const myRecord = records.find((r) => r.employeeId === user?.$id);

  const handleCheckInOut = async () => {
    if (!user?.$id || !user?.companyId) return;
    setIsCheckingIn(true);
    try {
      if (!myRecord) {
        await attendanceService.checkIn(user.$id, user.companyId);
        Alert.alert("Success", "Checked in successfully!");
        await loadAttendanceData();
      } else if (!myRecord.checkOut || myRecord.checkOut === "-") {
        await attendanceService.checkOut(user.$id);
        Alert.alert("Success", "Checked out successfully!");
        await loadAttendanceData();
      } else {
        Alert.alert("Info", "Shift completed for today.");
      }
    } catch (error: any) {
      Alert.alert("Action Failed", error.message || "An error occurred.");
    } finally {
      setIsCheckingIn(false);
    }
  };  

  useEffect(() => {
    if (user?.companyId) {
      loadAttendanceData();

      const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.ATTENDANCE}.documents`;
      const unsubscribe = appwriteClient.subscribe(channel, () => {
        loadAttendanceData();
      });
      return () => unsubscribe();
    }
  }, [loadAttendanceData, user?.companyId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(
        records.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, records]);

  const containerStyle: ViewStyle = { flex: 1, backgroundColor: isDark ? THEME.dark.background.main : THEME.light.background.main };
  const contentStyle: ViewStyle = { paddingHorizontal: THEME.spacing.lg, paddingVertical: THEME.spacing.md };

  const renderMetricsGrid = () => {
    if (loading && !stats) return <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: THEME.spacing.md }}><SkeletonLoader type="card" count={4} /></View>;
    if (!stats) return null;

    const metrics = [
      { label: "Present", value: stats.present.toString(), icon: <MaterialCommunityIcons name="check-circle" size={24} color={THEME.colors.primary} /> },
      { label: "Absent", value: stats.absent.toString(), icon: <MaterialCommunityIcons name="close-circle" size={24} color={THEME.colors.danger} /> },
      { label: "On Time", value: stats.presentOnTime.toString(), icon: <MaterialCommunityIcons name="clock" size={24} color={THEME.colors.success} /> },
      { label: "Late", value: stats.lateArrivals.toString(), icon: <MaterialCommunityIcons name="alert-circle" size={24} color={THEME.colors.warning} /> },
    ];

    return (
      <Animated.View entering={FadeInDown.springify()} style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: THEME.spacing.lg, gap: THEME.spacing.md }}>
        {metrics.map((metric, index) => (
          <Animated.View key={index} entering={ZoomIn.delay(index * 100).springify()} style={{ width: "48%", marginBottom: THEME.spacing.sm }}>
            <MetricCard label={metric.label} value={metric.value} icon={metric.icon} />
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={filteredRecords}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary, marginBottom: 4 }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary }}>IN: {item.checkIn} • OUT: {item.checkOut}</Text>
                </View>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.status === "present" ? THEME.colors.success : item.status === "late" ? THEME.colors.warning : THEME.colors.danger }} />
              </View>
            </PremiumCard>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentStyle}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAttendanceData} />}
        ListHeaderComponent={() => (
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <View style={{ marginBottom: THEME.spacing.lg, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ fontSize: 28, fontWeight: "700", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary }}>Attendance</Text>
                <Text style={{ fontSize: 14, color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary }}>Overview Dashboard</Text>
              </View>
              <TouchableOpacity onPress={handleCheckInOut} disabled={isCheckingIn} style={{ backgroundColor: myRecord && (!myRecord.checkOut || myRecord.checkOut === "-") ? THEME.colors.danger : THEME.colors.primary, paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.sm, borderRadius: THEME.borderRadius.md }}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{!myRecord ? "Check In" : !myRecord.checkOut || myRecord.checkOut === "-" ? "Check Out" : "Completed"}</Text>
              </TouchableOpacity>
            </View>

            {/* Launch Admin Panel Button */}
            {user?.role === "admin" && (
              <TouchableOpacity
                onPress={() => router.push("/(dashboard)/employees/manage-attendance")}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: THEME.colors.primary, paddingVertical: 12, borderRadius: THEME.borderRadius.md, marginBottom: THEME.spacing.lg, ...THEME.shadows.sm }}
              >
                <MaterialCommunityIcons name="shield-account-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Open Admin Management Console</Text>
              </TouchableOpacity>
            )}

            {renderMetricsGrid()}
            <Text style={{ fontSize: 18, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary, marginBottom: THEME.spacing.md }}>Logs List</Text>
            <SearchBar placeholder="Search employee logs..." value={searchQuery} onChangeText={setSearchQuery} style={{ marginBottom: THEME.spacing.md }} />
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}