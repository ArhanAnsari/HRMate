/**
 * 💰 PREMIUM PAYROLL CONTROL CENTRE
 * Administrative workspace for managing salary distributions, structures, and batch payouts
 */

import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { payrollQueries } from "@/src/services/appwriteClient";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

export default function PayrollScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const [payroll, setPayroll] = useState<any>(null);
  const [recentPayslips, setRecentPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayrollData = useCallback(async () => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      const [stats, slips] = await Promise.all([
        payrollQueries.getPayrollStats(user.companyId),
        payrollQueries.getPayslips(user.companyId),
      ]);
      setPayroll(stats);
      setRecentPayslips(slips ? slips.slice(0, 5) : []); // Keep top 5 historical logs
    } catch (error) {
      console.error("Error loading payroll dashboard:", error);
      Alert.alert(
        "Data Error",
        "Could not sync backend salary data registries.",
      );
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadPayrollData();
  }, [loadPayrollData]);

  const themeStyles = isDark ? THEME.dark : THEME.light;

  const renderHeader = () => {
    const metrics = [
      {
        label: "Total Pay Periods",
        value: payroll?.total?.toString() || "0",
        icon: (
          <MaterialCommunityIcons
            name="calculator"
            size={22}
            color={THEME.colors.primary}
          />
        ),
      },
      {
        label: "Processed (Released)",
        value: payroll?.successfullyProcessed?.toString() || "0",
        icon: (
          <MaterialCommunityIcons
            name="check-decagram"
            size={22}
            color={THEME.colors.success}
          />
        ),
      },
      {
        label: "Pending (Drafts)",
        value: payroll?.pendingProcessing?.toString() || "0",
        icon: (
          <MaterialCommunityIcons
            name="file-clock-outline"
            size={22}
            color={THEME.colors.warning}
          />
        ),
      },
    ];

    return (
      <View style={{ marginBottom: THEME.spacing.md }}>
        {/* Navigation Action Buttons Deck */}
        <View
          style={{
            flexDirection: "row",
            gap: THEME.spacing.md,
            marginBottom: THEME.spacing.lg,
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(dashboard)/payslips")}
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: THEME.colors.primary,
              paddingVertical: 14,
              borderRadius: THEME.borderRadius.md,
              gap: 6,
              ...THEME.shadows.sm,
            }}
          >
            <MaterialCommunityIcons
              name="wallet-outline"
              size={18}
              color="#fff"
            />
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
              View Statements
            </Text>
          </TouchableOpacity>

          {user?.role === "admin" && (
            <TouchableOpacity
              onPress={() => router.push("/(dashboard)/payroll/setup")} // 👈 Updated Route
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDark
                  ? THEME.colors.dark.backgroundAlt
                  : "#fff",
                borderWidth: 1,
                borderColor: themeStyles.border,
                paddingVertical: 14,
                borderRadius: THEME.borderRadius.md,
                gap: 6,
              }}
            >
              <MaterialCommunityIcons
                name="cog-outline"
                size={18}
                color={themeStyles.text.secondary}
              />
              <Text
                style={{
                  color: themeStyles.text.secondary,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Wages Setup
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Real-time Payroll Metrics Cards Container */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: themeStyles.text.primary,
            marginBottom: THEME.spacing.sm,
          }}
        >
          Current Period Metrics
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            gap: THEME.spacing.md,
            paddingBottom: THEME.spacing.md,
          }}
        >
          {metrics.map((metric, index) => (
            <Animated.View
              key={index}
              entering={ZoomIn.delay(index * 100).springify()}
              style={{ width: 160 }}
            >
              <MetricCard
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
              />
            </Animated.View>
          ))}
        </ScrollView>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: themeStyles.text.primary,
            marginVertical: THEME.spacing.md,
          }}
        >
          Recent Historical Disbursals
        </Text>
      </View>
    );
  };

  const renderRecentItem = ({ item, index }: { item: any; index: number }) => {
    const net = item.net_salary ?? (item.amount ? Number(item.amount) : 0);
    let monthLabel = "Salary Period";
    try {
      if (item.month) {
        monthLabel = new Date(item.month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
    } catch (_) {}

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
        <PremiumCard style={{ marginBottom: THEME.spacing.sm }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: themeStyles.text.primary,
                }}
              >
                {item.employee || "Staff Disbursal"}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: themeStyles.text.secondary,
                  marginTop: 2,
                }}
              >
                Period: {monthLabel}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: THEME.colors.success,
                }}
              >
                ₹{net.toLocaleString("en-IN")}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: themeStyles.text.tertiary,
                  marginTop: 2,
                }}
              >
                Paid out
              </Text>
            </View>
          </View>
        </PremiumCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: themeStyles.background.main }}
    >
      {/* Upper Main Branding Row Header */}
      <View
        style={{
          paddingHorizontal: THEME.spacing.lg,
          paddingVertical: THEME.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: themeStyles.border,
        }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: themeStyles.text.primary,
          }}
        >
          Payroll Vault
        </Text>
        <Text style={{ fontSize: 12, color: themeStyles.text.secondary }}>
          Manage operational distribution ledgers
        </Text>
      </View>

      <FlatList
        data={recentPayslips}
        renderItem={renderRecentItem}
        keyExtractor={(item) => item.id || item.$id}
        contentContainerStyle={{ padding: THEME.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPayrollData} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: THEME.spacing.xl }}>
            {loading ? (
              <SkeletonLoader type="list" count={3} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="file-cancel-outline"
                  size={44}
                  color={themeStyles.text.tertiary}
                />
                <Text
                  style={{
                    color: themeStyles.text.tertiary,
                    fontSize: 13,
                    marginTop: THEME.spacing.xs,
                  }}
                >
                  No historical logs recorded for this account.
                </Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
