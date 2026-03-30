import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import React from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useColorScheme } from "../../../hooks/use-color-scheme";
import { Colors, Spacing } from "../../constants";
import { Employee, Payslip } from "../../types";

interface PayslipDisplayProps {
  payslip: Payslip;
  employee?: Employee;
  onDownload?: (payslipId: string) => Promise<void>;
}

// Simple HTML to PDF text converter (for environments without native PDF)
const generatePayslipHTML = (payslip: Payslip, employee?: Employee): string => {
  const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    },
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Payslip - ${monthName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
        .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .period { font-size: 14px; color: #666; }
        .employee-info { margin-bottom: 30px; }
        .employee-info p { margin: 5px 0; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: bold; background: #f9fafb; padding: 10px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: right; border-bottom: 1px solid #ddd; }
        th { background: #f3f4f6; font-weight: bold; text-align: left; }
        td { text-align: right; }
        .label { text-align: left; }
        .total-row { font-weight: bold; background: #f9fafb; }
        .net-salary { font-size: 18px; font-weight: bold; color: #10b981; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="title">SALARY PAYSLIP</div>
          <div class="period">${monthName}</div>
        </div>
        
        <div class="employee-info">
          ${employee ? `<p><strong>Employee:</strong> ${employee.firstName} ${employee.lastName}</p>` : ""}
          <p><strong>Status:</strong> ${payslip.status}</p>
          <p><strong>Generated:</strong> ${new Date(payslip.createdAt).toLocaleDateString("en-IN")}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Earnings</div>
          <table>
            <tr>
              <th>Component</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td class="label">Basic Salary</td>
              <td>₹${payslip.calculation.basicSalary.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}</td>
            </tr>
            <tr>
              <td class="label">Allowances</td>
              <td>₹${payslip.calculation.allowances.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}</td>
            </tr>
            <tr class="total-row">
              <td class="label">Gross Salary</td>
              <td>₹${payslip.calculation.grossSalary.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Deductions</div>
          <table>
            <tr>
              <th>Component</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td class="label">Deductions</td>
              <td>₹${payslip.calculation.deductions.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}</td>
            </tr>
            <tr class="total-row">
              <td class="label">Total Deductions</td>
              <td>₹${payslip.calculation.deductions.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}</td>
            </tr>
          </table>
        </div>
        
        <div class="section" style="background: #f0fdf4; padding: 15px; border-radius: 5px;">
          <table style="border: none;">
            <tr class="total-row" style="border: none; background: none;">
              <td class="label" style="border: none; font-size: 18px;">Net Salary</td>
              <td style="border: none; font-size: 18px; color: #10b981;">₹${payslip.calculation.netSalary.toLocaleString(
                "en-IN",
                {
                  maximumFractionDigits: 2,
                },
              )}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a system-generated payslip. No signature is required.</p>
          <p>For any queries, please contact HR department.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const PayslipDisplay: React.FC<PayslipDisplayProps> = ({
  payslip,
  employee,
  onDownload,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    },
  );

  const handleDownload = async () => {
    try {
      const html = generatePayslipHTML(payslip, employee);
      const fileName = `payslip_${payslip.month}_${payslip.year}.html`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, html);

      if (Platform.OS === "ios" || Platform.OS === "android") {
        await Sharing.shareAsync(filePath, {
          mimeType: "text/html",
          dialogTitle: "Share Payslip",
        });
      }

      if (onDownload) {
        await onDownload(payslip.$id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download payslip");
    }
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1f1f1f" : "#fff",
        borderRadius: 12,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: isDark ? "#333" : "#e5e7eb",
        marginBottom: Spacing.md,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: Spacing.md,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#333" : "#e5e7eb",
        }}
      >
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
            📄 {monthName}
          </Text>
          {employee && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {employee.firstName} {employee.lastName}
            </Text>
          )}
        </View>
        <View
          style={{
            backgroundColor:
              payslip.status === "generated" ? "#dcfce7" : "#e0e7ff",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: payslip.status === "generated" ? "#166534" : "#312e81",
              textTransform: "capitalize",
            }}
          >
            {payslip.status}
          </Text>
        </View>
      </View>

      {/* Salary Breakdown */}
      <View style={{ gap: Spacing.md, marginBottom: Spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: Spacing.sm,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Gross Salary
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
            ₹
            {payslip.calculation.grossSalary.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: Spacing.sm,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Deductions
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#ef4444" }}>
            -₹
            {payslip.calculation.deductions.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: Spacing.sm,
            paddingTop: Spacing.md,
            borderTopWidth: 1,
            borderTopColor: isDark ? "#333" : "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>
            Net Salary
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#10b981" }}>
            ₹
            {payslip.calculation.netSalary.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: "row", gap: Spacing.sm }}>
        <TouchableOpacity
          onPress={handleDownload}
          style={{
            flex: 1,
            backgroundColor: "#3b82f6",
            paddingVertical: Spacing.md,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>
            📥 Download
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          style={{
            flex: 1,
            backgroundColor: isDark ? "#2a2a2a" : "#f3f4f6",
            paddingVertical: Spacing.md,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "600", fontSize: 13 }}>
            📤 Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
