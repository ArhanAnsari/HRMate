/**
 * 🏖️ PREMIUM LEAVES HUB MANAGEMENT CONSOLE
 */

import { FAB } from "@/src/components/ui/FAB";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { APPWRITE_CONFIG, DB_IDS } from "@/src/config/env";
import { usePermissions } from "@/src/hooks/usePermissions";
import { appwriteClient } from "@/src/services/appwrite";
import { employeeQueries } from "@/src/services/appwriteClient"; // 👈 Added to load the staff list
import { leavesService } from "@/src/services/leaves.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { LeaveType } from "@/src/types";
import { Action } from "@/src/utils/permissions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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

  // Leave Form dialog panel state machine
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  // 🌟 NEW: On Behalf/Proxy Mode State
  const [filingTarget, setFilingTarget] = useState<"self" | "employee">("self");
  const [staffRoster, setStaffRoster] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [showRosterDropdown, setShowRosterDropdown] = useState(false);

  const themeStyles = isDark ? THEME.dark : THEME.light;

  const loadLeaveData = useCallback(async () => {
    if (!user?.companyId || !user?.$id) return;

    setLoading(true);
    setLoadError(false);
    try {
      const [stats, requests, rawStaff] = await Promise.all([
        leavesService.getLeaveBalance(user.companyId, user.$id),
        can(Action.VIEW_ALL_LEAVES)
          ? leavesService.getPendingLeaves(user.companyId)
          : leavesService.getEmployeeLeaves(user.companyId, user.$id),
        can(Action.APPROVE_LEAVES)
          ? employeeQueries.getEmployees(user.companyId)
          : Promise.resolve([]), // Load staff map if admin/manager
      ]);

      setLeaveStats({
        totalDays: stats.total || stats.totalDays || 0,
        usedDays: stats.used || stats.usedDays || 0,
        remainingDays: stats.remaining || stats.remainingDays || 0,
      });

      setLeaveRequests(requests);
      if (rawStaff) setStaffRoster(rawStaff);
    } catch (error) {
      console.error("Failed to load real-time leave dataset:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId, user?.$id, user?.role]);

  useEffect(() => {
    let unsubscribe: () => void;

    if (user?.companyId && user?.$id) {
      loadLeaveData();

      const channel = `databases.${APPWRITE_CONFIG.DATABASE_ID}.collections.${DB_IDS.LEAVES}.documents`;
      unsubscribe = appwriteClient.subscribe(channel, () => {
        loadLeaveData();
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadLeaveData, user?.companyId, user?.$id]);

  const handleApplyLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      Alert.alert(
        "Missing Requirements",
        "Please fulfill all active input options.",
      );
      return;
    }

    // Determine target applicant target parameters
    const targetEmployeeId =
      filingTarget === "self" ? user!.$id : selectedEmployeeId;
    if (!targetEmployeeId) {
      Alert.alert(
        "Selection Required",
        "Please select an active employee from the list roster.",
      );
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert(
        "Invalid Syntax",
        "Format must comply exactly with YYYY-MM-DD template structures.",
      );
      return;
    }

    if (end < start) {
      Alert.alert(
        "Logical Bounds Error",
        "End terminal date cannot precede start timeline date.",
      );
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const numberOfDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

    if (!user?.companyId) return;

    setApplyLoading(true);
    try {
      await leavesService.applyLeave(user.companyId, targetEmployeeId, {
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
      setFilingTarget("self");
      setSelectedEmployeeId("");
      Alert.alert("Success", "Leave request dispatched cleanly.");
      loadLeaveData();
    } catch (error: any) {
      Alert.alert(
        "Handshake Failure",
        error?.message || "Failed to commit leave document.",
      );
    } finally {
      setApplyLoading(false);
    }
  };

  const handleAction = async (
    leaveId: string,
    type: "cancel" | "approve" | "reject",
  ) => {
    try {
      if (type === "cancel") {
        Alert.alert(
          "Revoke Application",
          "Are you sure you want to completely remove this log query?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Confirm Delete",
              style: "destructive",
              onPress: async () => {
                await leavesService.cancelLeave(leaveId);
                loadLeaveData();
              },
            },
          ],
        );
      } else if (type === "approve") {
        await leavesService.approveLeave(leaveId, user!.$id, "Approved");
        loadLeaveData();
      } else {
        await leavesService.rejectLeave(leaveId, user!.$id, "Rejected");
        loadLeaveData();
      }
    } catch (e) {
      Alert.alert("Execution error", `Failed to complete ${type} operation.`);
    }
  };

  const renderLeaveItem = ({ item, index }: { item: any; index: number }) => {
    const statusThemes: Record<
      string,
      { color: string; bg: string; icon: string }
    > = {
      approved: {
        color: THEME.colors.success,
        bg: THEME.colors.successLight,
        icon: "check-circle",
      },
      pending: {
        color: THEME.colors.warning,
        bg: THEME.colors.warningLight,
        icon: "clock-outline",
      },
      rejected: {
        color: THEME.colors.danger,
        bg: THEME.colors.dangerLight,
        icon: "close-circle",
      },
    };

    const status = (item.status || "pending").toLowerCase();
    const currentTheme = statusThemes[status] || statusThemes.pending;

    // Cross reference proxy name if applied on behalf of another employee
    const applicantName =
      item.employeeId === user?.$id
        ? "Myself"
        : staffRoster.find((s) => s.id === item.employeeId)?.name ||
          `Staff ID: ${item.employeeId.substring(0, 6)}`;

    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: THEME.spacing.sm,
            }}
          >
            <View style={{ flex: 1, paddingRight: THEME.spacing.sm }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: themeStyles.text.primary,
                  textTransform: "capitalize",
                }}
              >
                🌴 {item.leaveType} Request
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: THEME.colors.primary,
                  fontWeight: "600",
                  marginTop: 2,
                }}
              >
                Applicant: {applicantName}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: themeStyles.text.secondary,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                Notes: "{item.reason || "No explicit justification filed."}"
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: currentTheme.bg,
                paddingHorizontal: THEME.spacing.sm,
                paddingVertical: 4,
                borderRadius: THEME.borderRadius.sm,
              }}
            >
              <MaterialCommunityIcons
                name={currentTheme.icon as any}
                size={14}
                color={currentTheme.color}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: currentTheme.color,
                  textTransform: "uppercase",
                }}
              >
                {status}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderTopWidth: 1,
              borderTopColor: themeStyles.border,
              paddingTop: THEME.spacing.sm,
              marginTop: THEME.spacing.xs,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  color: themeStyles.text.tertiary,
                  marginBottom: 2,
                }}
              >
                Duration Timeline
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: themeStyles.text.primary,
                }}
              >
                {item.startDate} ➔ {item.endDate}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 11,
                  color: themeStyles.text.tertiary,
                  marginBottom: 2,
                }}
              >
                Deduction Cost
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: THEME.colors.primary,
                }}
              >
                {item.numberOfDays} Work Days
              </Text>
            </View>
          </View>

          {item.status === "pending" && (
            <View
              style={{
                flexDirection: "row",
                gap: THEME.spacing.sm,
                marginTop: THEME.spacing.md,
              }}
            >
              <TouchableOpacity
                onPress={() => handleAction(item.$id, "cancel")}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: THEME.borderRadius.md,
                  backgroundColor: isDark
                    ? THEME.colors.dark.backgroundTertiary
                    : "#f1f5f9",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: themeStyles.border,
                }}
              >
                <Text
                  style={{
                    color: THEME.colors.danger,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  Cancel Request
                </Text>
              </TouchableOpacity>
              {can(Action.APPROVE_LEAVES) && (
                <>
                  <TouchableOpacity
                    onPress={() => handleAction(item.$id, "approve")}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: THEME.borderRadius.md,
                      backgroundColor: THEME.colors.successLight,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: THEME.colors.success,
                    }}
                  >
                    <Text
                      style={{
                        color: THEME.colors.success,
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      Approve
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAction(item.$id, "reject")}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: THEME.borderRadius.md,
                      backgroundColor: THEME.colors.dangerLight,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: THEME.colors.danger,
                    }}
                  >
                    <Text
                      style={{
                        color: THEME.colors.danger,
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      Reject
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </PremiumCard>
      </Animated.View>
    );
  };

  // Find label corresponding to the currently selected employee row
  const selectedStaffLabel =
    staffRoster.find((s) => s.id === selectedEmployeeId)?.name ||
    "Select Employee...";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeStyles.background.main }}
    >
      <FlatList
        data={leaveRequests}
        renderItem={renderLeaveItem}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{
          paddingHorizontal: THEME.spacing.lg,
          paddingVertical: THEME.spacing.md,
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadLeaveData} />
        }
        ListHeaderComponent={() => (
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: themeStyles.text.primary,
                marginBottom: 4,
              }}
            >
              Leaves Tracker
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: themeStyles.text.secondary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Manage your dynamic leave metrics and active requests
            </Text>

            {leaveStats && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: THEME.spacing.lg,
                  gap: THEME.spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <MetricCard
                    label="Allowed Limit"
                    value={leaveStats.totalDays.toString()}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <MetricCard
                    label="Remaining Balance"
                    value={leaveStats.remainingDays.toString()}
                  />
                </View>
              </View>
            )}

            {loading && !leaveStats && <SkeletonLoader type="card" count={3} />}
            {loadError && !loading && (
              <Text
                style={{
                  textAlign: "center",
                  color: THEME.colors.danger,
                  marginVertical: THEME.spacing.md,
                }}
              >
                Handshake validation failed. Drop down to clear.
              </Text>
            )}
            {!loading && leaveRequests.length === 0 && (
              <Text
                style={{
                  textAlign: "center",
                  color: themeStyles.text.tertiary,
                  marginVertical: THEME.spacing.xl,
                }}
              >
                No active leave log records. Tap + to request leave.
              </Text>
            )}
            {leaveRequests.length > 0 && (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: themeStyles.text.primary,
                  marginBottom: THEME.spacing.md,
                }}
              >
                Active Operational Queue
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

      {/* Modern Glassmorphic Application Drawer Modal */}
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
            backgroundColor: "rgba(15,23,42,0.65)",
          }}
        >
          <View
            style={{
              backgroundColor: themeStyles.background.main,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: THEME.spacing.xl,
              maxHeight: "85%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: themeStyles.text.primary,
                  marginBottom: THEME.spacing.md,
                }}
              >
                File Leave Application
              </Text>

              {/* 🌟 NEW: FILING-FOR SELECTOR FOR MANAGERS / ADMINS */}
              {/* KEEP THE NATIVE COMPLIANT VIEW ELEMENT */}
              {can(Action.APPROVE_LEAVES) && (
                <View style={{ marginBottom: THEME.spacing.md }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: themeStyles.text.secondary,
                      marginBottom: THEME.spacing.xs,
                    }}
                  >
                    Filing On Behalf Of
                  </Text>
                  <View style={{ flexDirection: "row", gap: THEME.spacing.xs }}>
                    <TouchableOpacity
                      onPress={() => {
                        setFilingTarget("self");
                        setShowRosterDropdown(false);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: THEME.borderRadius.md,
                        alignItems: "center",
                        backgroundColor:
                          filingTarget === "self"
                            ? THEME.colors.primary
                            : themeStyles.background.tertiary,
                        borderWidth: 1,
                        borderColor:
                          filingTarget === "self"
                            ? THEME.colors.primary
                            : themeStyles.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            filingTarget === "self"
                              ? "#fff"
                              : themeStyles.text.secondary,
                        }}
                      >
                        Myself
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setFilingTarget("employee")}
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        borderRadius: THEME.borderRadius.md,
                        alignItems: "center",
                        backgroundColor:
                          filingTarget === "employee"
                            ? THEME.colors.primary
                            : themeStyles.background.tertiary,
                        borderWidth: 1,
                        borderColor:
                          filingTarget === "employee"
                            ? THEME.colors.primary
                            : themeStyles.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color:
                            filingTarget === "employee"
                              ? "#fff"
                              : themeStyles.text.secondary,
                        }}
                      >
                        An Employee
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 🌟 NEW: DYNAMIC STAFF ROSTER DROP PANEL SELECTOR */}
              {filingTarget === "employee" && (
                <View style={{ marginBottom: THEME.spacing.md, zIndex: 50 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: themeStyles.text.secondary,
                      marginBottom: THEME.spacing.xs,
                    }}
                  >
                    Target Employee
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowRosterDropdown(!showRosterDropdown)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: themeStyles.border,
                      borderRadius: THEME.borderRadius.md,
                      padding: THEME.spacing.sm,
                      backgroundColor: themeStyles.background.tertiary,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedEmployeeId
                          ? themeStyles.text.primary
                          : themeStyles.text.tertiary,
                        fontSize: 14,
                      }}
                    >
                      {selectedStaffLabel}
                    </Text>
                    <MaterialCommunityIcons
                      name={showRosterDropdown ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={themeStyles.text.secondary}
                    />
                  </TouchableOpacity>

                  {showRosterDropdown && (
                    <View
                      style={{
                        backgroundColor: isDark
                          ? THEME.colors.dark.backgroundTertiary
                          : "#fff",
                        borderWidth: 1,
                        borderColor: themeStyles.border,
                        borderRadius: THEME.borderRadius.md,
                        marginTop: 4,
                        maxHeight: 150,
                        overflow: "scroll",
                      }}
                    >
                      {staffRoster.map((staff) => (
                        <TouchableOpacity
                          key={staff.id}
                          onPress={() => {
                            setSelectedEmployeeId(staff.id);
                            setShowRosterDropdown(false);
                          }}
                          style={{
                            padding: THEME.spacing.sm,
                            borderBottomWidth: 1,
                            borderBottomColor: themeStyles.border,
                            backgroundColor:
                              selectedEmployeeId === staff.id
                                ? THEME.colors.primaryLight
                                : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color: themeStyles.text.primary,
                              fontSize: 13,
                            }}
                          >
                            {staff.name} •{" "}
                            <Text
                              style={{
                                color: themeStyles.text.secondary,
                                fontSize: 11,
                              }}
                            >
                              {staff.department}
                            </Text>
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Horizontal Dynamic Leave Type Switch Slider */}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: themeStyles.text.secondary,
                  marginBottom: THEME.spacing.xs,
                }}
              >
                Classification Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  flexDirection: "row",
                  gap: THEME.spacing.xs,
                  marginBottom: THEME.spacing.md,
                }}
              >
                {LEAVE_TYPES.map((type) => {
                  const isActive = leaveType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setLeaveType(type)}
                      style={{
                        paddingHorizontal: THEME.spacing.md,
                        paddingVertical: 8,
                        borderRadius: THEME.borderRadius.md,
                        backgroundColor: isActive
                          ? THEME.colors.primary
                          : themeStyles.background.tertiary,
                        borderWidth: 1,
                        borderColor: isActive
                          ? THEME.colors.primary
                          : themeStyles.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: isActive ? "#fff" : themeStyles.text.secondary,
                          textTransform: "capitalize",
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TextInput
                placeholder="Start Date Bounds (YYYY-MM-DD)"
                placeholderTextColor={themeStyles.text.tertiary}
                style={{
                  borderWidth: 1,
                  borderColor: themeStyles.border,
                  borderRadius: THEME.borderRadius.md,
                  padding: THEME.spacing.sm,
                  color: themeStyles.text.primary,
                  backgroundColor: themeStyles.background.tertiary,
                  marginBottom: THEME.spacing.md,
                  fontSize: 14,
                }}
                value={startDate}
                onChangeText={setStartDate}
                editable={!applyLoading}
              />
              <TextInput
                placeholder="End Date Bounds (YYYY-MM-DD)"
                placeholderTextColor={themeStyles.text.tertiary}
                style={{
                  borderWidth: 1,
                  borderColor: themeStyles.border,
                  borderRadius: THEME.borderRadius.md,
                  padding: THEME.spacing.sm,
                  color: themeStyles.text.primary,
                  backgroundColor: themeStyles.background.tertiary,
                  marginBottom: THEME.spacing.md,
                  fontSize: 14,
                }}
                value={endDate}
                onChangeText={setEndDate}
                editable={!applyLoading}
              />
              <TextInput
                placeholder="File description/justification notes..."
                placeholderTextColor={themeStyles.text.tertiary}
                style={{
                  borderWidth: 1,
                  borderColor: themeStyles.border,
                  borderRadius: THEME.borderRadius.md,
                  padding: THEME.spacing.sm,
                  color: themeStyles.text.primary,
                  backgroundColor: themeStyles.background.tertiary,
                  marginBottom: THEME.spacing.xl,
                  fontSize: 14,
                  height: 90,
                  textAlignVertical: "top",
                }}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                editable={!applyLoading}
              />

              <View
                style={{
                  flexDirection: "row",
                  gap: THEME.spacing.md,
                  marginTop: THEME.spacing.sm,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowApplyModal(false)}
                  disabled={applyLoading}
                  style={{
                    flex: 1,
                    paddingVertical: THEME.spacing.md,
                    borderRadius: THEME.borderRadius.md,
                    alignItems: "center",
                    backgroundColor: themeStyles.background.tertiary,
                  }}
                >
                  <Text
                    style={{
                      color: themeStyles.text.primary,
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
                      Submit Request
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
