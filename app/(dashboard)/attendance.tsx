/**
 * 📊 ATTENDANCE SCREEN - Premium Design with Bulk Management Panel
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { appwriteClient } from "@/src/services/appwrite";
import {
  AttendanceRecord,
  AttendanceStats,
  attendanceService,
} from "@/src/services/attendance.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  // Determine current user attendance status
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
        Alert.alert("Info", "You have already completed your shift today.");
      }
    } catch (error: any) {
      Alert.alert("Action Failed", error.message || "An error occurred.");
    } finally {
      setIsCheckingIn(false);
    }
  };  

  const handleBulkMark = async (status: "present" | "absent" | "late") => {
    if (!user?.companyId) return;
    
    Alert.alert(
      "Bulk Mark Attendance",
      `Are you sure you want to mark all remaining unlogged employees as ${status} for today?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsBulkProcessing(true);
            try {
              await attendanceService.bulkMarkAll(user.companyId!, status);
              Alert.alert("Success", `Remaining employees marked as ${status}!`);
              await loadAttendanceData();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to execute bulk operation.");
            } finally {
              setIsBulkProcessing(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    let unsubscribe: () => void;

    if (user?.companyId) {
      loadAttendanceData();

      const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.ATTENDANCE}.documents`;
      unsubscribe = appwriteClient.subscribe(channel, (response) => {
        const payload = response.payload as any;
        if (payload && payload.company_id === user.companyId) {
          loadAttendanceData();
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadAttendanceData, user?.companyId]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(
        records.filter((r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      );
    }
  }, [searchQuery, records]);

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark ? THEME.dark.background.main : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const headerStyle: ViewStyle = {
    marginBottom: THEME.spacing.lg,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const subtitleStyle: TextStyle = {
    fontSize: 14,
    color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
  };

  const metricsGridStyle: ViewStyle = {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: THEME.spacing.lg,
    gap: THEME.spacing.md,
  };

  const metricItemStyle: ViewStyle = {
    width: "48%",
    marginBottom: THEME.spacing.sm,
  };

  const sectionTitleStyle: TextStyle = {
    fontSize: 18,
    fontWeight: "600",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.md,
  };

  const renderMetricsGrid = () => {
    if (loading && !stats) {
      return (
        <View style={metricsGridStyle}>
          <SkeletonLoader type="card" count={4} />
        </View>
      );
    }

    if (!stats) return null;

    const metrics = [
      {
        label: "Present",
        value: stats.present.toString(),
        icon: <MaterialCommunityIcons name="check-circle" size={24} color={THEME.colors.primary} />,
      },
      {
        label: "Absent",
        value: stats.absent.toString(),
        icon: <MaterialCommunityIcons name="close-circle" size={24} color={THEME.colors.danger} />,
      },
      {
        label: "On Time",
        value: stats.presentOnTime.toString(),
        icon: <MaterialCommunityIcons name="clock" size={24} color={THEME.colors.success} />,
      },
      {
        label: "Late",
        value: stats.lateArrivals.toString(),
        icon: <MaterialCommunityIcons name="alert-circle" size={24} color={THEME.colors.warning} />,
      },
    ];

    return (
      <Animated.View entering={FadeInDown.springify()} style={metricsGridStyle}>
        {metrics.map((metric, index) => (
          <Animated.View
            key={index}
            entering={ZoomIn.delay(index * 100).springify()}
            style={metricItemStyle}
          >
            <MetricCard label={metric.label} value={metric.value} icon={metric.icon} />
          </Animated.View>
        ))}
      </Animated.View>
    );
  };

  const renderAttendanceRecord = ({ item, index }: { item: AttendanceRecord; index: number }) => {
    const statusColors: Record<string, string> = {
      present: THEME.colors.success,
      absent: THEME.colors.danger,
      late: THEME.colors.warning,
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary, marginBottom: THEME.spacing.xs }}>
                {item.name}
              </Text>
              <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
                <View>
                  <Text style={{ fontSize: 12, color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary, marginBottom: THEME.spacing.xs }}>Check In</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary }}>{item.checkIn}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary, marginBottom: THEME.spacing.xs }}>Check Out</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary }}>{item.checkOut}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 12, color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary, marginBottom: THEME.spacing.xs }}>Duration</Text>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? THEME.dark.text.primary : THEME.light.text.primary }}>{item.duration}</Text>
                </View>
              </View>
            </View>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: statusColors[item.status], justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "white", fontWeight: "600" }}>
                {item.status === "present" ? "✓" : item.status === "late" ? "!" : "✕"}
              </Text>
            </View>
          </View>
        </PremiumCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadAttendanceData} />
        }
        ListHeaderComponent={() => (
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <View style={[headerStyle, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
              <View>
                <Text style={titleStyle}>Attendance</Text>
                <Text style={subtitleStyle}>Today&apos;s attendance overview</Text>
              </View>
              <TouchableOpacity
                onPress={handleCheckInOut}
                disabled={isCheckingIn}
                style={{
                  backgroundColor: myRecord && (!myRecord.checkOut || myRecord.checkOut === "-") ? THEME.colors.danger : THEME.colors.primary,
                  paddingHorizontal: THEME.spacing.md,
                  paddingVertical: THEME.spacing.sm,
                  borderRadius: THEME.borderRadius.md,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {!myRecord ? "Check In" : !myRecord.checkOut || myRecord.checkOut === "-" ? "Check Out" : "Checked Out"}
                </Text>
              </TouchableOpacity>
            </View>

            {renderMetricsGrid()}

            {/* Admin Management Action Deck Component Panel */}
            {user?.role === "admin" && (
              <View style={{ 
                flexDirection: "row", 
                gap: THEME.spacing.md, 
                marginBottom: THEME.spacing.lg,
                backgroundColor: isDark ? THEME.colors.dark.backgroundAlt : THEME.colors.background.alt,
                padding: THEME.spacing.md,
                borderRadius: THEME.borderRadius.lg,
                borderWidth: 1,
                borderColor: isDark ? THEME.dark.border : THEME.light.border
              }}>
                <TouchableOpacity
                  disabled={isBulkProcessing || loading}
                  onPress={() => handleBulkMark("present")}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: THEME.colors.successLight,
                    paddingVertical: THEME.spacing.sm,
                    borderRadius: THEME.borderRadius.md,
                    borderWidth: 1,
                    borderColor: THEME.colors.success
                  }}
                >
                  <MaterialCommunityIcons name="check-all" size={16} color={THEME.colors.success} style={{ marginRight: 6 }} />
                  <Text style={{ color: THEME.colors.success, fontWeight: "700", fontSize: 13 }}>Mark All Present</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isBulkProcessing || loading}
                  onPress={() => handleBulkMark("absent")}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: THEME.colors.dangerLight,
                    paddingVertical: THEME.spacing.sm,
                    borderRadius: THEME.borderRadius.md,
                    borderWidth: 1,
                    borderColor: THEME.colors.danger
                  }}
                >
                  <MaterialCommunityIcons name="close-circle-outline" size={16} color={THEME.colors.danger} style={{ marginRight: 6 }} />
                  <Text style={{ color: THEME.colors.danger, fontWeight: "700", fontSize: 13 }}>Mark All Absent</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={sectionTitleStyle}>Attendance Records</Text>
            <SearchBar
              placeholder="Search employee..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ marginBottom: THEME.spacing.md }}
            />
            
            {!loading && filteredRecords.length === 0 && (
              <Text style={{
                fontSize: 14,
                color: isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary,
                textAlign: "center",
                marginVertical: THEME.spacing.xl,
              }}>
                {records.length > 0 && searchQuery.trim() !== "" ? "No matching employees." : "No attendance records for today."}
              </Text>
            )}
          </Animated.View>
        )}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}