/**
 * 📄 PAYSLIP SCREEN - View & Download
 * Display payslips with download and share options
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { payrollQueries } from "@/src/services/appwriteClient";
import { PayslipData, PayslipService } from "@/src/services/payslip.service";
import { useAuthStore } from "@/src/state/auth.store";
import { THEME } from "@/src/theme";

interface PayslipRecord {
  $id: string;
  employee_id: string;
  basic_salary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  net_salary: number;
  month: string;
  payment_date?: string;
  created_at: string;
}

export default function PayslipScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sharing, setSharing] = useState<string | null>(null);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      // Fetch payslips from Appwrite (real data)
      if (user?.companyId) {
        const data = await payrollQueries.getPayslips(user.companyId);
        setPayslips(data || []);
      }
    } catch (error) {
      console.error("Error loading payslips:", error);
      Alert.alert("Error", "Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payslip: any) => {
    setDownloading(payslip.$id);
    try {
      const payslipData: PayslipData = {
        employeeName: user?.name || "Employee",
        employeeId: payslip.employee_id,
        position: user?.role || "Employee",
        department: "Operations",
        basicSalary: payslip.basic_salary,
        allowances: payslip.allowances,
        bonus: payslip.bonus,
        deductions: payslip.deductions,
        tax: payslip.tax,
        netSalary: payslip.net_salary,
        paymentDate: payslip.payment_date || new Date().toISOString(),
        periodStart: new Date(payslip.month).toISOString(),
        periodEnd: new Date(
          new Date(payslip.month).getTime() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        workingDays: 22,
        leaveDays: 0,
      };

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
    setSharing(payslip.$id);
    try {
      const payslipData: PayslipData = {
        employeeName: user?.name || "Employee",
        employeeId: payslip.employee_id,
        position: user?.role || "Employee",
        department: "Operations",
        basicSalary: payslip.basic_salary,
        allowances: payslip.allowances,
        bonus: payslip.bonus,
        deductions: payslip.deductions,
        tax: payslip.tax,
        netSalary: payslip.net_salary,
        paymentDate: payslip.payment_date || new Date().toISOString(),
        periodStart: new Date(payslip.month).toISOString(),
        periodEnd: new Date(
          new Date(payslip.month).getTime() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        workingDays: 22,
        leaveDays: 0,
      };

      await PayslipService.sharePayslip(payslipData);
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share payslip");
    } finally {
      setSharing(null);
    }
  };

  const handlePreviewPayslip = (payslip: PayslipRecord) => {
    // Navigate to preview route if created
    // For now, we'll just show an alert
    const summary = PayslipService.generatePayslipSummary({
      employeeName: user?.name || "Employee",
      employeeId: payslip.employee_id,
      position: user?.role || "Employee",
      department: "Operations",
      basicSalary: payslip.basic_salary,
      allowances: payslip.allowances,
      bonus: payslip.bonus,
      deductions: payslip.deductions,
      tax: payslip.tax,
      netSalary: payslip.net_salary,
      paymentDate: payslip.payment_date || new Date().toISOString(),
      periodStart: new Date(payslip.month).toISOString(),
      periodEnd: new Date(
        new Date(payslip.month).getTime() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      workingDays: 22,
      leaveDays: 0,
    });

    Alert.alert("Payslip Summary", summary);
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: isDark
      ? THEME.dark.background.main
      : THEME.light.background.main,
  };

  const styles = StyleSheet.create({
    container: containerStyle,
    header: {
      paddingHorizontal: THEME.spacing.lg,
      paddingVertical: THEME.spacing.md,
      backgroundColor: isDark
        ? THEME.dark.background.alt
        : THEME.light.background.alt,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    headerTitle: {
      fontSize: THEME.typography.h2.fontSize,
      fontWeight: "700",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    content: {
      flex: 1,
      padding: THEME.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: THEME.spacing.lg,
    },
    emptyIcon: {
      fontSize: 48,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      marginBottom: THEME.spacing.md,
    },
    emptyText: {
      fontSize: THEME.typography.body.fontSize,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
      textAlign: "center",
    },
    payslipCard: {
      marginBottom: THEME.spacing.md,
      backgroundColor: isDark
        ? THEME.dark.background.alt
        : THEME.light.background.alt,
      borderRadius: THEME.spacing.md,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    payslipHeader: {
      paddingHorizontal: THEME.spacing.md,
      paddingVertical: THEME.spacing.md,
      backgroundColor: isDark
        ? THEME.dark.background.tertiary
        : THEME.light.background.tertiary,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    payslipMonth: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
      marginBottom: 4,
    },
    payslipDate: {
      fontSize: 11,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    },
    payslipContent: {
      paddingHorizontal: THEME.spacing.md,
      paddingVertical: THEME.spacing.md,
    },
    salaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: THEME.spacing.sm,
    },
    salaryLabel: {
      fontSize: 12,
      color: isDark ? THEME.dark.text.secondary : THEME.light.text.secondary,
    },
    salaryValue: {
      fontSize: 12,
      fontWeight: "600",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    netSalaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: THEME.spacing.md,
      borderTopWidth: 1,
      borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
      marginTop: THEME.spacing.md,
    },
    netSalaryLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
    netSalaryValue: {
      fontSize: 14,
      fontWeight: "700",
      color: "#16A34A",
    },
    actionButtons: {
      flexDirection: "row",
      gap: THEME.spacing.sm,
      paddingHorizontal: THEME.spacing.md,
      paddingVertical: THEME.spacing.md,
      borderTopWidth: 1,
      borderTopColor: isDark ? THEME.dark.border : THEME.light.border,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: THEME.spacing.md,
      borderRadius: THEME.spacing.sm,
      gap: THEME.spacing.xs,
    },
    previewButton: {
      backgroundColor: isDark
        ? THEME.dark.background.alt
        : THEME.light.background.alt,
    },
    downloadButton: {
      backgroundColor: "#3B82F6",
    },
    shareButton: {
      backgroundColor: "#8B5CF6",
    },
    buttonText: {
      fontSize: 12,
      fontWeight: "600",
      color: "white",
    },
    previewButtonText: {
      color: isDark ? THEME.dark.text.primary : THEME.light.text.primary,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (payslips.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payslips</Text>
        </View>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="file-document-outline"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No payslips available yet</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payslips</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {payslips.map((payslip) => (
          <View key={payslip.$id} style={styles.payslipCard}>
            <View style={styles.payslipHeader}>
              <Text style={styles.payslipMonth}>
                {new Date(payslip.month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <Text style={styles.payslipDate}>
                Paid on{" "}
                {new Date(
                  payslip.payment_date || payslip.created_at,
                ).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.payslipContent}>
              <View style={styles.salaryRow}>
                <Text style={styles.salaryLabel}>Gross Salary</Text>
                <Text style={styles.salaryValue}>
                  ₹
                  {(
                    payslip.basic_salary +
                    payslip.allowances +
                    payslip.bonus
                  ).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.salaryRow}>
                <Text style={styles.salaryLabel}>Deductions & Tax</Text>
                <Text style={styles.salaryValue}>
                  ₹{(payslip.deductions + payslip.tax).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.netSalaryRow}>
                <Text style={styles.netSalaryLabel}>Net Salary</Text>
                <Text style={styles.netSalaryValue}>
                  ₹{payslip.net_salary.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.previewButton]}
                onPress={() => handlePreviewPayslip(payslip)}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={16}
                  color={
                    isDark ? THEME.dark.text.primary : THEME.light.text.primary
                  }
                />
                <Text
                  style={[styles.buttonText, styles.previewButtonText]}
                  numberOfLines={1}
                >
                  Preview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={() => handleDownloadPayslip(payslip)}
                disabled={downloading === payslip.$id}
              >
                {downloading === payslip.$id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="download"
                      size={16}
                      color="white"
                    />
                    <Text style={styles.buttonText}>Download</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={() => handleSharePayslip(payslip)}
                disabled={sharing === payslip.$id}
              >
                {sharing === payslip.$id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="share-variant"
                      size={16}
                      color="white"
                    />
                    <Text style={styles.buttonText}>Share</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

