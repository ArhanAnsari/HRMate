/**
 * 🏖️ LEAVES SCREEN - Premium Design
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { usePermissions } from "@/src/hooks/usePermissions";
import { appwriteClient } from "@/src/services/appwrite";
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { LeaveType } from "@/src/types";
import { Action } from "@/src/utils/permissions";
import React, { useCallback, useEffect, useState } from "react";
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
  const { can } = usePermissions();
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Apply Leave modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const loadLeaveData = useCallback(async () => {
    if (!user?.companyId || !user?.$id) return;

    setLoading(true);
    setLoadError(false);
    try {
      const [stats, requests] = await Promise.all([
        leavesService.getLeaveBalance(user.companyId, user.$id),
        can(Action.VIEW_ALL_LEAVES)
          ? leavesService.getPendingLeaves(user.companyId)
          : leavesService.getEmployeeLeaves(user.companyId, user.$id),
      ]);

      setLeaveStats({
        totalDays: stats.total,
        usedDays: stats.used,
        remainingDays: stats.remaining,
      });

      setLeaveRequests(requests);
    } catch (error) {
      console.error("Failed to load leave data:", error);
      setLeaveStats(null);
      setLeaveRequests([]);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, user?.$id, user?.role]);

  useEffect(() => {
    let unsubscribe: () => void;

    if (user?.companyId && user?.$id) {
      loadLeaveData();

      // Realtime subscription to the leaves collection
      const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.LEAVES}.documents`;
      unsubscribe = appwriteClient.subscribe(channel, (response) => {
        const payload = response.payload as any;
        if (payload && payload.company_id === user.companyId) {
          loadLeaveData();
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadLeaveData, user?.companyId, user?.$id]);

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

  const handleCancelLeave = async (leaveId: string) => {
    Alert.alert(
      "Cancel Leave",
      "Are you sure you want to cancel this leave application?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await leavesService.cancelLeave(leaveId);
              loadLeaveData();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel leave request.");
            }
          },
        },
      ],
    );
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await leavesService.approveLeave(leaveId, user!.$id, "Approved");
      loadLeaveData();
    } catch (error) {
      Alert.alert("Error", "Failed to approve leave request.");
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await leavesService.rejectLeave(leaveId, user!.$id, "Rejected");
      loadLeaveData();
    } catch (error) {
      Alert.alert("Error", "Failed to reject leave request.");
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

      {item.status === "pending" && (
        <View
          style={{
            flexDirection: "row",
            marginTop: THEME.spacing.md,
            gap: THEME.spacing.sm,
          }}
        >
          <TouchableOpacity
            style={{
              padding: 8,
              backgroundColor: THEME.colors.danger,
              borderRadius: 6,
              flex: 1,
              alignItems: "center",
            }}
            onPress={() => handleCancelLeave(item.$id)}
          >
            <Text style={{ color: "white", fontSize: 13, fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>
          {can(Action.APPROVE_LEAVES) && (
            <>
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: THEME.colors.success,
                  borderRadius: 6,
                  flex: 1,
                  alignItems: "center",
                }}
                onPress={() => handleApproveLeave(item.$id)}
              >
                <Text
                  style={{ color: "white", fontSize: 13, fontWeight: "600" }}
                >
                  Approve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: THEME.colors.warning,
                  borderRadius: 6,
                  flex: 1,
                  alignItems: "center",
                }}
                onPress={() => handleRejectLeave(item.$id)}
              >
                <Text
                  style={{ color: "white", fontSize: 13, fontWeight: "600" }}
                >
                  Reject
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
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
                    />
                  )}
                </View>
              </View>
            )}

            {loading && (
              <View style={{ marginTop: THEME.spacing.md }}>
                <SkeletonLoader type="card" count={3} />
              </View>
            )}

            {loadError && !loading && (
              <Text
                style={{
                  fontSize: 14,
                  color: THEME.colors.danger,
                  textAlign: "center",
                  marginVertical: THEME.spacing.md,
                }}
              >
                Failed to load leave data. Pull down to refresh.
              </Text>
            )}

            {leaveRequests.length === 0 && !loading && !loadError && (
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
                color: isDark
                  ? THEME.dark.text.primary
                  : THEME.light.text.primary,
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
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
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
                    color: isDark
                      ? THEME.dark.text.primary
                      : THEME.light.text.primary,
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
