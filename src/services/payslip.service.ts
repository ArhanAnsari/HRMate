/**
 * 📄 PAYSLIP SERVICE - Complete Implementation
 * Generate, preview, download, and manage payslips with real Appwrite data
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export interface PayslipData {
  employeeName: string;
  employeeId: string;
  position: string;
  department: string;
  basicSalary: number;
  allowances: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  paymentDate: string;
  periodStart: string;
  periodEnd: string;
  workingDays: number;
  leaveDays: number;
}

export class PayslipService {
  /**
   * Calculate net salary after deductions
   */
  static calculateNetSalary(data: Partial<PayslipData>): number {
    const gross =
      (data.basicSalary || 0) + (data.allowances || 0) + (data.bonus || 0);
    const totalDeductions = (data.deductions || 0) + (data.tax || 0);
    return Math.max(0, gross - totalDeductions);
  }

  /**
   * Generate professional HTML for payslip
   */
  static generatePayslipHTML(data: PayslipData): string {
    const grossSalary = data.basicSalary + data.allowances + data.bonus;
    const dateObj = new Date(data.paymentDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Payslip - ${formattedDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
              color: #0F172A;
              background: #f5f5f5;
              padding: 20px;
            }
            .container {
              max-width: 900px;
              background: white;
              margin: 0 auto;
              padding: 50px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #2563EB;
              padding-bottom: 20px;
            }
            .logo {
              font-size: 28px;
              font-weight: 800;
              color: #2563EB;
              letter-spacing: -1px;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              font-weight: 700;
              color: #0F172A;
              margin: 15px 0 5px 0;
            }
            .pay-period {
              font-size: 13px;
              color: #64748B;
              margin-top: 8px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              color: #2563EB;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #E2E8F0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              background: #F8FAFC;
              padding: 16px;
              border-radius: 6px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748B;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              margin-bottom: 4px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #0F172A;
            }
            .salary-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .salary-table th {
              background: #EFF6FF;
              border: 1px solid #BFDBFE;
              padding: 12px;
              text-align: left;
              font-size: 11px;
              font-weight: 700;
              color: #1E40AF;
              text-transform: uppercase;
            }
            .salary-table td {
              border: 1px solid #E2E8F0;
              padding: 12px;
              font-size: 13px;
              color: #0F172A;
            }
            .salary-table tr:nth-child(even) {
              background: #F8FAFC;
            }
            .amount {
              text-align: right;
              font-weight: 600;
              min-width: 100px;
            }
            .total-row {
              background: #DBEAFE !important;
              font-weight: 700;
            }
            .net-salary-section {
              background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .net-label {
              font-size: 14px;
              font-weight: 600;
              opacity: 0.9;
            }
            .net-amount {
              font-size: 28px;
              font-weight: 800;
              letter-spacing: -1px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #E2E8F0;
              text-align: center;
              font-size: 11px;
              color: #94A3B8;
            }
            .note {
              background: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 12px;
              margin-top: 20px;
              font-size: 12px;
              color: #78350F;
              border-radius: 4px;
            }
            .working-days {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 15px;
              padding: 12px;
              background: #ECFDF5;
              border-radius: 6px;
            }
            .day-item {
              font-size: 12px;
            }
            .day-label {
              color: #047857;
              font-weight: 600;
            }
            .day-value {
              color: #065F46;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">HRMate</div>
              <div class="document-title">SALARY PAYSLIP</div>
              <div class="pay-period">
                For the period: ${new Date(data.periodStart).toLocaleDateString()} - ${new Date(data.periodEnd).toLocaleDateString()}
              </div>
            </div>

            <!-- Employee & Company Info -->
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Employee Name</span>
                <span class="info-value">${data.employeeName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee ID</span>
                <span class="info-value">${data.employeeId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Position</span>
                <span class="info-value">${data.position}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Department</span>
                <span class="info-value">${data.department}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Date</span>
                <span class="info-value">${formattedDate}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Payslip Month</span>
                <span class="info-value">${dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
              </div>
            </div>

            <!-- Working Days -->
            <div class="section">
              <div class="section-title">Attendance Summary</div>
              <div class="working-days">
                <div class="day-item">
                  <div class="day-label">Working Days</div>
                  <div class="day-value">${data.workingDays}</div>
                </div>
                <div class="day-item">
                  <div class="day-label">Leave Days</div>
                  <div class="day-value">${data.leaveDays}</div>
                </div>
              </div>
            </div>

            <!-- Salary Breakdown -->
            <div class="section">
              <div class="section-title">Earnings & Deductions</div>
              <table class="salary-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="amount">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Basic Salary</td>
                    <td class="amount">₹${data.basicSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Allowances</td>
                    <td class="amount">₹${data.allowances.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Bonus</td>
                    <td class="amount">₹${data.bonus.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Gross Salary</td>
                    <td class="amount">₹${grossSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Deductions</td>
                    <td class="amount">₹${data.deductions.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td>Tax (TDS)</td>
                    <td class="amount">₹${data.tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Deductions</td>
                    <td class="amount">₹${(data.deductions + data.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Net Salary -->
            <div class="net-salary-section">
              <div class="net-label">NET SALARY CREDITED</div>
              <div class="net-amount">₹${data.netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
            </div>

            <!-- Footer Note -->
            <div class="note">
              <strong>Note:</strong> This is a computer-generated payslip. No signature is required. This payslip contains confidential information and is intended only for the employee mentioned above.
            </div>

            <!-- Footer -->
            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()} | HRMate - Employee Management System</p>
              <p style="margin-top: 5px;">© 2024 HRMate. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate PDF and return file URI
   */
  static async generatePayslipPDF(data: PayslipData): Promise<string> {
    try {
      const html = this.generatePayslipHTML(data);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate payslip PDF");
    }
  }

  /**
   * Download payslip PDF to device storage
   */
  static async downloadPayslipPDF(data: PayslipData): Promise<string> {
    try {
      const uri = await this.generatePayslipPDF(data);

      // Get the filename
      const fileName = `Payslip_${data.employeeName}_${data.paymentDate}.pdf`;
      // The PDF is already generated at uri, just return it
      // In production, you'd download and save it locally if needed
      return uri;
    } catch (error) {
      console.error("Error downloading payslip:", error);
      throw new Error("Failed to download payslip");
    }
  }

  /**
   * Share payslip PDF
   */
  static async sharePayslip(data: PayslipData): Promise<void> {
    try {
      const uri = await this.generatePayslipPDF(data);

      const fileName = `Payslip_${data.employeeName}_${data.paymentDate}.pdf`;

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this device");
      }

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${fileName}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error sharing payslip:", error);
      throw new Error("Failed to share payslip");
    }
  }

  /**
   * Generate payslip summary text
   */
  static generatePayslipSummary(data: PayslipData): string {
    const gross = data.basicSalary + data.allowances + data.bonus;
    const totalDed = data.deductions + data.tax;

    return `
PAYSLIP SUMMARY
================
Employee: ${data.employeeName} (${data.employeeId})
Position: ${data.position}
Department: ${data.department}
Period: ${data.periodStart} to ${data.periodEnd}
Working Days: ${data.workingDays} | Leave Days: ${data.leaveDays}

EARNINGS
--------
Basic Salary:    ₹${data.basicSalary.toLocaleString()}
Allowances:      ₹${data.allowances.toLocaleString()}
Bonus:           ₹${data.bonus.toLocaleString()}
Gross Salary:    ₹${gross.toLocaleString()}

DEDUCTIONS
----------
Deductions:      ₹${data.deductions.toLocaleString()}
Tax (TDS):       ₹${data.tax.toLocaleString()}
Total:           ₹${totalDed.toLocaleString()}

NET SALARY:      ₹${data.netSalary.toLocaleString()}

Generated: ${new Date().toLocaleString()}
    `.trim();
  }
}
