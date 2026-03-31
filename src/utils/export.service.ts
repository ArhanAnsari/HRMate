/**
 * 📊 EXPORT UTILITIES
 * Helper functions for exporting data to CSV format
 */

export class ExportService {
  static generateCSV(data: any[], filename: string = "export.csv"): string {
    if (!data || data.length === 0) {
      return "";
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV header row
    const csvHeaders = headers.map((h) => `"${h}"`).join(",");

    // Create CSV data rows
    const csvRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '""';
          }
          const strValue = String(value).replace(/"/g, '""');
          return `"${strValue}"`;
        })
        .join(","),
    );

    return [csvHeaders, ...csvRows].join("\n");
  }

  static generateEmployeesCSV(employees: any[]): string {
    const formatted = employees.map((emp) => ({
      "Employee ID": emp.employeeId,
      "Full Name": emp.name,
      Email: emp.email,
      Department: emp.department,
      Role: emp.role,
      Salary: emp.salary,
      "Join Date": emp.joinDate,
      Status: emp.status,
      Phone: emp.phone || "",
      Manager: emp.manager_id || "",
    }));

    return this.generateCSV(formatted, "employees.csv");
  }

  static generateAttendanceCSV(attendanceRecords: any[]): string {
    const formatted = attendanceRecords.map((record) => ({
      Date: record.date,
      "Employee Name": record.employeeName,
      "Check In": record.checkInTime || "",
      "Check Out": record.checkOutTime || "",
      Status: record.status,
      "Working Hours": record.workingHours || "",
    }));

    return this.generateCSV(formatted, "attendance.csv");
  }

  static generatePayrollCSV(payrollData: any[]): string {
    const formatted = payrollData.map((record) => ({
      "Employee Name": record.employeeName,
      "Basic Salary": record.basicSalary,
      Allowances: record.allowances || 0,
      Bonus: record.bonus || 0,
      "Gross Salary": record.grossSalary,
      Deductions: record.deductions || 0,
      "Net Salary": record.netSalary,
      "Payment Date": record.paymentDate,
      Status: record.status,
    }));

    return this.generateCSV(formatted, "payroll.csv");
  }

  static generateLeavesCSV(leaveRecords: any[]): string {
    const formatted = leaveRecords.map((record) => ({
      "Employee Name": record.employeeName,
      "Leave Type": record.leaveType,
      "Start Date": record.startDate,
      "End Date": record.endDate,
      "Number of Days": record.numberOfDays,
      Reason: record.reason || "",
      Status: record.status,
      "Approved By": record.approvedBy || "",
    }));

    return this.generateCSV(formatted, "leaves.csv");
  }

  static async shareCSV(csvContent: string, filename: string) {
    try {
      // For React Native, we would use react-native-share
      // This is a placeholder that should be called from the screen component
      return { success: true, message: "CSV ready to share", data: csvContent };
    } catch (error) {
      console.error("Failed to share CSV:", error);
      return { success: false, message: "Failed to share CSV" };
    }
  }
}

export default ExportService;
