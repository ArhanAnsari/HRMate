import { MetricCard } from "@/src/components/ui/MetricCard";
import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { payrollService } from "@/src/services/domain.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayrollScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();
  const [payroll, setPayroll] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      loadPayrollData();
    }
  }, [user?.companyId]);

  const loadPayrollData = async () => {
    if (!user?.companyId) return;

    setLoading(true);
    try {
      const [data, slips] = await Promise.all([
        payrollService.getPayrollStats(user.companyId),
        payrollService.getPayslips(user.companyId),
      ]);
      setPayroll(data);
      setPayslips(slips);
    } catch (error) {
      console.error("Failed to load payroll data:", error);
    } finally {
      setLoading(false);
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

  const renderPayslip = ({ item }: { item: any }) => (
    <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
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
              color: isDark
                ? THEME.dark.text.primary
                : THEME.light.text.primary,
              marginBottom: THEME.spacing.xs,
            }}
          >
            {item.employee}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark
                ? THEME.dark.text.secondary
                : THEME.light.text.secondary,
            }}
          >
            {item.month}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              color: THEME.colors.success,
              marginBottom: THEME.spacing.xs,
            }}
          >
            {item.amount}
          </Text>
          <View
            style={{
              backgroundColor:
                item.status === "paid"
                  ? "rgba(76, 175, 80, 0.1)"
                  : "rgba(255, 193, 7, 0.1)",
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
                  item.status === "paid"
                    ? THEME.colors.success
                    : THEME.colors.warning,
              }}
            >
              {item.status === "paid" ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>
      </View>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={containerStyle}>
      <FlatList
        data={payslips}
        renderItem={renderPayslip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contentStyle}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPayrollData} />
        }
        ListHeaderComponent={() => (
          <View>
            <Text style={titleStyle}>Payroll</Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark
                  ? THEME.dark.text.secondary
                  : THEME.light.text.secondary,
                marginBottom: THEME.spacing.lg,
              }}
            >
              Salary processing and payslips
            </Text>

            <PrimaryButton
              label="Run Payroll Now"
              onPress={() => {
                Alert.alert(
                  "Run Payroll",
                  "This will process real salaries, generate payslips in the cloud, and issue payouts for all active employees. Continue?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Start Processing",
                      onPress: async () => {
                        if (!user?.companyId) return;
                        setLoading(true);
                        try {
                          const processed = await payrollService.processPayroll(
                            user.companyId,
                          );
                          Alert.alert(
                            "Success",
                            `Payroll processed. Generated ${processed} payslip(s) in Appwrite for the current month!`,
                          );
                          loadPayrollData(); // refresh data
                        } catch (err: any) {
                          Alert.alert(
                            "Error",
                            err.message || "Failed to process payroll",
                          );
                          setLoading(false);
                        }
                      },
                    },
                  ],
                );
              }}
              style={{
                marginBottom: THEME.spacing.md,
                backgroundColor: THEME.colors.primary,
              }}
            />

            <PrimaryButton
              label="View Downloadable Payslips"
              onPress={() => router.push("/(dashboard)/payslips")}
              variant="secondary"
              style={{ marginBottom: THEME.spacing.lg }}
            />

            {payroll && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: THEME.spacing.xl,
                }}
              >
                <View style={{ width: "48%" }}>
                  <MetricCard
                    label="Processed"
                    value={payroll.successfullyProcessed.toString()}
                    trend={{ direction: "up", percentage: 5 }}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <MetricCard
                    label="Pending"
                    value={payroll.pendingProcessing.toString()}
                    trend={{ direction: "down", percentage: 2 }}
                  />
                </View>
              </View>
            )}

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
              Recent Payslips
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
