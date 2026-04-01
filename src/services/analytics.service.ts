/**
 * 📊 Analytics Service - Real Appwrite data pipeline for charts and insights
 *
 * Provides chart-ready data from real Appwrite collections:
 *   - getAttendanceTrends(companyId)   → weekly attendance rates
 *   - getPayrollDistribution(companyId) → avg salary per department
 *   - getLeaveStats(companyId)          → leave status distribution
 */

import { Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { databases } from "./appwrite";

export interface AttendanceTrendPoint {
  day: string;
  rate: number;
}

export interface DepartmentPayroll {
  department: string;
  avgSalary: number;
}

export interface LeaveDistribution {
  approved: number;
  pending: number;
  rejected: number;
}

export const analyticsService = {
  /**
   * Get attendance trend (past 7 days) for a company.
   * Returns one data point per day with the attendance rate (0–100).
   */
  async getAttendanceTrends(
    companyId: string,
  ): Promise<AttendanceTrendPoint[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 6);

      // Use full ISO timestamps for consistent Appwrite datetime comparisons
      const startOfRange = new Date(startDate);
      startOfRange.setUTCHours(0, 0, 0, 0);
      const endOfRange = new Date(endDate);
      endOfRange.setUTCHours(23, 59, 59, 999);

      const records = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("company_id", companyId),
          Query.greaterThanEqual("date", startOfRange.toISOString()),
          Query.lessThanEqual("date", endOfRange.toISOString()),
          Query.limit(500),
        ],
      );

      // Bucket records by date
      const byDate: Record<string, { present: number; total: number }> = {};
      for (const doc of records.documents as any[]) {
        const d: string = (doc.date || "").split("T")[0];
        if (!d) continue;
        if (!byDate[d]) byDate[d] = { present: 0, total: 0 };
        byDate[d].total++;
        if (doc.status === "present" || doc.status === "late")
          byDate[d].present++;
      }

      // Build sorted array for the last 7 days
      const result: AttendanceTrendPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(endDate.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const bucket = byDate[key];
        const rate =
          bucket && bucket.total > 0
            ? Math.round((bucket.present / bucket.total) * 100)
            : 0;
        result.push({ day: label, rate });
      }

      return result;
    } catch (error) {
      console.error("Failed to fetch attendance trends:", error);
      return [];
    }
  },

  /**
   * Get average salary per department from the employees collection.
   * Returns chart-ready arrays of department names and their avg salaries.
   */
  async getPayrollDistribution(
    companyId: string,
  ): Promise<{ departments: string[]; avgSalaries: number[]; avgSalary: number }> {
    const empty = { departments: [], avgSalaries: [], avgSalary: 0 };
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const employees = response.documents as any[];
      if (employees.length === 0) return empty;

      // Aggregate by department
      const deptMap: Record<string, { total: number; count: number }> = {};
      let globalTotal = 0;

      for (const emp of employees) {
        const dept: string = emp.department || "Other";
        const salary: number = Number(emp.base_salary) || 0;
        if (!deptMap[dept]) deptMap[dept] = { total: 0, count: 0 };
        deptMap[dept].total += salary;
        deptMap[dept].count++;
        globalTotal += salary;
      }

      const avgSalary = Math.round(globalTotal / employees.length);
      const departments = Object.keys(deptMap);
      const avgSalaries = departments.map((d) =>
        Math.round(deptMap[d].total / deptMap[d].count),
      );

      return { departments, avgSalaries, avgSalary };
    } catch (error) {
      console.error("Failed to fetch payroll distribution:", error);
      return empty;
    }
  },

  /**
   * Count leave requests by status (approved / pending / rejected).
   */
  async getLeaveDistribution(companyId: string): Promise<LeaveDistribution> {
    const empty = { approved: 0, pending: 0, rejected: 0 };
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const leaves = response.documents as any[];
      return {
        approved: leaves.filter((l) => l.status === "approved").length,
        pending: leaves.filter((l) => l.status === "pending").length,
        rejected: leaves.filter((l) => l.status === "rejected").length,
      };
    } catch (error) {
      console.error("Failed to fetch leave distribution:", error);
      return empty;
    }
  },
};
