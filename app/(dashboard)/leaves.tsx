/**
 * 🏖️ LEAVES SCREEN - Premium Design
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { LeaveType } from "@/src/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LEAVE_TYPES: LeaveType[] = ["sick", "casual", "paid", "unpaid"];

export default function LeavesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Apply Leave modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (user?.companyId && user?.$id) {
      loadLeaveData();
    }
  }, [user?.companyId, user?.$id]);

  const loadLeaveData = async () => {
    if (!user?.companyId || !user?.$id) return;

    setLoading(true);
    try {
      const [stats, requests] = await Promise.all([
        leavesService.getLeaveBalance(user.companyId, user.$id),
        leavesService.getEmployeeLeaves(user.companyId, user.$id),
      ]);

      setLeaveStats({
        totalDays: stats.total,
        usedDays: stats.used,
        remainingDays: stats.remaining,
      });

      setLeaveRequests(requests);
    } catch (error) {
      console.error("Failed to load leave data:", error);
      setLeaveStats({
        totalDays: 20,
        usedDays: 0,
        remainingDays: 20,
      });
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Error", "Please enter valid dates in YYYY-MM-DD format.");
      return;
    }

    if (end < start) {
      Alert.alert("Error", "End date cannot be before start date.");
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const numberOfDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (!user?.companyId || !user?.$id) {
      Alert.alert("Error", "User session not found. Please log in again.");
      return;
    }

    setApplyLoading(true);
    try {
      await leavesService.applyLeave(user.companyId, user.$id, {
        leaveType,
        startDate,
        endDate,
        numberOfDays,
        reason: reason.trim(),
      });

      setShowApplyModal(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setLeaveType("casual");
      Alert.alert("Success", "Leave application submitted successfully.");
      loadLeaveData();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Failed to submit leave application.",
      );
    } finally {
      setApplyLoading(false);
    }
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
  };

  const titleStyle: TextStyle = {
    fontSize: 28,
    fontWeight: "700",
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    marginBottom: THEME.spacing.sm,
  };

  const inputStyle: TextStyle = {
    borderWidth: 1,
    borderColor: isDark ? THEME.dark.border : THEME.light.border,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    backgroundColor: isDark
      ? THEME.dark.background.tertiary
      : THEME.light.background.tertiary,
    marginBottom: THEME.spacing.md,
    fontSize: 14,
  };

  const renderLeaveRequest = ({ item }: { item: any }) => (
    <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
      <View style={{ marginBottom: THEME.spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: THEME.spacing.sm,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.leaveType?.charAt(0).toUpperCase() +
              item.leaveType?.slice(1) || "Leave"}
          </Text>
          <View
            style={{
              backgroundColor:
                item.status === "approved"
                  ? "rgba(76, 175, 80, 0.1)"
                  : item.status === "pending"
                    ? "rgba(255, 193, 7, 0.1)"
                    : "rgba(244, 67, 54, 0.1)",
              paddingHorizontal: THEME.spacing.sm,
              paddingVertical: 2,
              borderRadius: THEME.borderRadius.sm,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color:
                  item.status === "approved"
                    ? THEME.colors.success
                    : item.status === "pending"
                      ? THEME.colors.warning
                      : THEME.colors.danger,
              }}
            >
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1) ||
                "Pending"}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: THEME.spacing.lg }}>
        <View>
          <Text
            style={{
              fontSize: 12,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            From
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.startDate}
          </Text>
        </View>
        {!!item.endDate && (
          <View>
            <Text
              style={{
                fontSize: 12,
                color: isDark
                  ? THEME.dark.text.tertiary
                  : THEME.light.text.tertiary,
                marginBottom: THEME.spacing.xs,
              }}
            >
              To
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
              }}
            >
              {item.endDate}
            </Text>
          </View>
        )}
        <View>
          <Text
            style={{
              fontSize: 12,
              color: isDark
                ? THEME.dark.text.tertiary
                : THEME.light.text.tertiary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            Days
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
            }}
          >
            {item.numberOfDays}
          </Text>
        </View>
      </View>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={leaveRequests}
        renderItem={renderLeaveRequest}
        keyExtractor={(item) => item.$id || Math.random().toString()}
        contentContainerStyle={contentStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLeaveData} />
        }
        ListHeaderComponent={() => (
          <View>
            <Text style={titleStyle}>Leaves</Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Your leave balance and requests
            </Text>

            {leaveStats && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  marginBottom: THEME.spacing.lg,
                  gap: THEME.spacing.md,
                }}
              >
                <View style={{ width: "48%" }}>
                  <MetricCard
                    label="Total Days"
                    value={leaveStats.totalDays.toString()}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  {leaveStats.totalDays > 0 && (
                    <MetricCard
                      label="Remaining"
                      value={leaveStats.remainingDays.toString()}
                      trend={{
                        direction:
                          leaveStats.remainingDays >= leaveStats.totalDays * 0.5
                            ? "up"
                            : "down",
                        percentage: Math.round(
                          (leaveStats.remainingDays / leaveStats.totalDays) *
                            100,
                        ),
                      }}
                    />
                  )}
                </View>
              </View>
            )}

            {leaveRequests.length === 0 && !loading && (
              <Text
                style={{
                  fontSize: 14,
                  color: isDark
                    ? THEME.dark.text.tertiary
                    : THEME.light.text.tertiary,
                  textAlign: "center",
                  marginVertical: THEME.spacing.xl,
                }}
              >
                No leave requests yet. Tap + to apply.
              </Text>
            )}

            {leaveRequests.length > 0 && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isDark
                    ? THEME.dark.text.primary
                    : THEME.light.text.primary,
                  marginBottom: THEME.spacing.md,
                }}
              >
                My Requests
              </Text>
            )}
          </View>
        )}
      />

      <FAB
        icon="plus"
        onPress={() => setShowApplyModal(true)}
        position="bottom-right"
      />

      {/* Apply for Leave Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowApplyModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: isDark
                ? THEME.dark.background.main
                : THEME.light.background.main,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: THEME.spacing.xl,
              maxHeight: "85%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Apply for Leave
            </Text>

            {/* Leave Type Selector */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
                marginBottom: THEME.spacing.sm,
              }}
            >
              Leave Type
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: THEME.spacing.sm,
                marginBottom: THEME.spacing.md,
              }}
            >
              {LEAVE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setLeaveType(type)}
                  style={{
                    paddingHorizontal: THEME.spacing.md,
                    paddingVertical: THEME.spacing.sm,
                    borderRadius: THEME.borderRadius.sm,
                    backgroundColor:
                      leaveType === type
                        ? THEME.colors.primary
                        : isDark
                          ? THEME.dark.background.tertiary
                          : THEME.light.background.tertiary,
                    borderWidth: 1,
                    borderColor:
                      leaveType === type
                        ? THEME.colors.primary
                        : isDark
                          ? THEME.dark.border
                          : THEME.light.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color:
                        leaveType === type
                          ? "#fff"
                          : isDark
                            ? THEME.dark.text.primary
                            : THEME.light.text.primary,
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={inputStyle}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={startDate}
              onChangeText={setStartDate}
              editable={!applyLoading}
            />
            <TextInput
              style={inputStyle}
              placeholder="End Date (YYYY-MM-DD)"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={endDate}
              onChangeText={setEndDate}
              editable={!applyLoading}
            />
            <TextInput
              style={[inputStyle, { height: 80, textAlignVertical: "top" }]}
              placeholder="Reason for leave"
              placeholderTextColor={
                isDark ? THEME.dark.text.tertiary : THEME.light.text.tertiary
              }
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              editable={!applyLoading}
            />

            <View style={{ flexDirection: "row", gap: THEME.spacing.md }}>
              <TouchableOpacity
                onPress={() => {
                  setShowApplyModal(false);
                  setStartDate("");
                  setEndDate("");
                  setReason("");
                  setLeaveType("casual");
                }}
                disabled={applyLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: isDark
                    ? THEME.dark.background.tertiary
                    : THEME.light.background.tertiary,
                }}
              >
                <Text
                  style={{
                    color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyLeave}
                disabled={applyLoading}
                style={{
                  flex: 1,
                  paddingVertical: THEME.spacing.md,
                  borderRadius: THEME.borderRadius.md,
                  alignItems: "center",
                  backgroundColor: THEME.colors.primary,
                }}
              >
                {applyLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
