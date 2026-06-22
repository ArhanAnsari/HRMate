/**
 * 📄 PREMIUM PAYSLIPS MANAGEMENT HUB
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

import { PremiumCard } from "@/src/components/ui/PremiumCard";
import { SkeletonLoader } from "@/src/components/ui/SkeletonLoader";
import { payrollQueries } from "@/src/services/appwriteClient";
import { PayslipData, PayslipService } from "@/src/services/payslip.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";

// Updated interface to perfectly match what your service query returns
interface PayslipRecord {
  id: string;
  employee?: string;
  employee_id?: string;
  basic_salary?: number;
  allowances?: number;
  bonus?: number;
  deductions?: number;
  tax?: number;
  net_salary?: number;
  amount?: string | number; // Added to handle formatted amounts safely
  month: string;
  payment_date?: string;
  created_at?: string;
}

export default function PayslipScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const [payslips, setPayslips] = useState<PayslipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      if (user?.companyId) {
        const data = await payrollQueries.getPayslips(user.companyId);
        setPayslips((data as any) || []);
      }
    } catch (error) {
      console.error("Error loading payslips:", error);
      Alert.alert("Error", "Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const extractPayslipData = (payslip: PayslipRecord): PayslipData => {
    const basic = payslip.basic_salary ?? 0;
    const allowances = payslip.allowances ?? 0;
    const bonus = payslip.bonus ?? 0;
    const deductions = payslip.deductions ?? 0;
    const tax = payslip.tax ?? 0;
    
    // Fallback safely to parsed amount property if net_salary field isn't present
    const net = payslip.net_salary ?? (payslip.amount ? Number(payslip.amount) : (basic + allowances + bonus - deductions - tax));

    return {
      employeeName: payslip.employee || user?.name || "Employee",
      employeeId: payslip.employee_id || payslip.id,
      position: user?.role || "Employee",
      department: "Operations",
      basicSalary: basic,
      allowances: allowances,
      bonus: bonus,
      deductions: deductions,
      tax: tax,
      netSalary: net,
      paymentDate: payslip.payment_date || payslip.created_at || new Date().toISOString(),
      periodStart: payslip.month ? new Date(payslip.month).toISOString() : new Date().toISOString(),
      periodEnd: payslip.month 
        ? new Date(new Date(payslip.month).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date().toISOString(),
      workingDays: 22,
      leaveDays: 0,
    };
  };

  const handleDownloadPayslip = async (payslip: PayslipRecord) => {
    setDownloading(payslip.id);
    try {
      const payslipData = extractPayslipData(payslip);
      const filePath = await PayslipService.downloadPayslipPDF(payslipData);
      Alert.alert("Success", `Payslip downloaded to: ${filePath}`);
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download payslip");
    } finally {
      setDownloading(null);
    }
  };

  const handleSharePayslip = async (payslip: PayslipRecord) => {
    setSharing(payslip.id);
    try {
      const payslipData = extractPayslipData(payslip);
      await PayslipService.sharePayslip(payslipData);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share payslip");
    } finally {
      setSharing(null);
    }
  };

  const handlePreviewPayslip = (payslip: PayslipRecord) => {
    const payslipData = extractPayslipData(payslip);
    const summary = PayslipService.generatePayslipSummary(payslipData);
    Alert.alert("Payslip Summary", summary);
  };

  const themeStyles = isDark ? THEME.dark : THEME.light;

  const renderPayslipItem = ({ item }: { item: PayslipRecord }) => {
    const basic = item.basic_salary ?? 0;
    const allowances = item.allowances ?? 0;
    const bonus = item.bonus ?? 0;
    const deductions = item.deductions ?? 0;
    const tax = item.tax ?? 0;
    
    const grossSalary = basic + allowances + bonus;
    const totalDeductions = deductions + tax;
    
    // Safely parse net value from item.amount fallback if needed
    const netSalary = item.net_salary ?? (item.amount ? Number(item.amount) : (grossSalary - totalDeductions));

    let formattedMonth = "Salary Period";
    try {
      if (item.month) {
        formattedMonth = new Date(item.month).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      }
    } catch (e) {
      console.warn(e);
    }

    const paidDate = item.payment_date || item.created_at;

    return (
      <PremiumCard style={{ marginBottom: THEME.spacing.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: themeStyles.border, paddingBottom: THEME.spacing.sm }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: themeStyles.text.primary }}>
              📅 {formattedMonth}
            </Text>
            {paidDate && (
              <Text style={{ fontSize: 11, color: themeStyles.text.tertiary, marginTop: 2 }}>
                Disbursed: {new Date(paidDate).toLocaleDateString()}
              </Text>
            )}
          </View>
          <View style={{ backgroundColor: THEME.colors.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: THEME.borderRadius.sm }}>
            <Text style={{ color: THEME.colors.success, fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
              Released
            </Text>
          </View>
        </View>

        <View style={{ gap: THEME.spacing.xs, marginBottom: THEME.spacing.md }}>
          {grossSalary > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: themeStyles.text.secondary }}>Gross Earnings</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: themeStyles.text.primary }}>
                ₹{grossSalary.toLocaleString("en-IN")}
              </Text>
            </View>
          )}
          {totalDeductions > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: themeStyles.text.secondary }}>Total Deductions</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: THEME.colors.danger }}>
                - ₹{totalDeductions.toLocaleString("en-IN")}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: themeStyles.border, paddingTop: THEME.spacing.sm, marginTop: THEME.spacing.xs }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: themeStyles.text.primary }}>Net Take-Home</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: THEME.colors.success }}>
              ₹{netSalary.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: THEME.spacing.sm, borderTopWidth: 1, borderTopColor: themeStyles.border, paddingTop: THEME.spacing.md }}>
          <TouchableOpacity
            onPress={() => handlePreviewPayslip(item)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: THEME.borderRadius.md, backgroundColor: isDark ? THEME.colors.dark.backgroundTertiary : "#f1f5f9", borderWidth: 1, borderColor: themeStyles.border, gap: 4 }}
          >
            <MaterialCommunityIcons name="eye-outline" size={16} color={themeStyles.text.secondary} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: themeStyles.text.secondary }}>Preview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={downloading === item.id}
            onPress={() => handleDownloadPayslip(item)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: THEME.borderRadius.md, backgroundColor: THEME.colors.primary, gap: 4 }}
          >
            {downloading === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="download" size={16} color="#fff" />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={sharing === item.id}
            onPress={() => handleSharePayslip(item)}
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: THEME.borderRadius.md, backgroundColor: "#8B5CF6", gap: 4 }}
          >
            {sharing === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="share-variant" size={16} color="#fff" />
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>Share</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </PremiumCard>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyles.background.main }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: THEME.spacing.lg, paddingVertical: THEME.spacing.md, borderBottomWidth: 1, borderBottomColor: themeStyles.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: THEME.spacing.sm, padding: THEME.spacing.xs }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={themeStyles.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "700", color: themeStyles.text.primary }}>Payslips Ledger</Text>
          <Text style={{ fontSize: 12, color: themeStyles.text.secondary }}>Verify digital statements and download histories</Text>
        </View>
      </View>

      <FlatList
        data={payslips}
        renderItem={renderPayslipItem}
        keyExtractor={(item) => item.id} // 👈 FIXED: Changed from item.$id to item.id to fix unique key prop warning
        contentContainerStyle={{ padding: THEME.spacing.lg }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPayslips} />}
        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 }}>
            <MaterialCommunityIcons name="file-document-outline" size={54} color={themeStyles.text.tertiary} style={{ marginBottom: THEME.spacing.md }} />
            <Text style={{ fontSize: 15, fontWeight: "600", color: themeStyles.text.secondary, textAlign: "center" }}>
              No generated statements found
            </Text>
            <Text style={{ fontSize: 12, color: themeStyles.text.tertiary, textAlign: "center", marginTop: 4, paddingHorizontal: THEME.spacing.xl }}>
              Payslips show up here once generated by an administrator for the current salary period.
            </Text>
          </View>
        )}
        ListHeaderComponent={() => loading && payslips.length === 0 ? <SkeletonLoader type="card" count={3} /> : null}
      />
    </SafeAreaView>
  );
}
