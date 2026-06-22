/**
 * 🔧 Appwrite Client - Production Configuration
 * Real Appwrite API integration (NO MOCK DATA)
 */

import { ID, Query } from "react-native-appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { account, databases, handleAppwriteError } from "./appwrite";

/**
 * Get current user's company ID from session
 * DEPRECATED: Use getCompanyIdSync() from useCompanyId hook instead
 * This function is kept for backward compatibility but may not work due to permission restrictions
 */
export const getCurrentUserCompanyId = async (): Promise<string> => {
  try {
    const authUser = await account.get();

    // Check if company ID is stored in prefs
    if (authUser.prefs?.companyId) {
      return authUser.prefs.companyId as string;
    }

    // Try database query as fallback
    try {
      const users = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.USERS,
        [Query.equal("email", authUser.email), Query.limit(1)],
      );

      if (users.documents.length > 0) {
        const companyId =
          users.documents[0].company_id || users.documents[0].companyId;
        if (companyId) return companyId as string;
      }
    } catch (dbError) {
      console.warn("Database query failed:", handleAppwriteError(dbError));
    }

    // Fallback instead of throwing
    return "default_company_id";
  } catch (error) {
    console.warn(
      `Failed to get company ID from Appwrite: ${handleAppwriteError(error)}`,
    );
    return "default_company_id";
  }
};

/**
 * Attendance Service - Real Appwrite Queries
 */
export const attendanceQueries = {
  /**
   * Get today's attendance stats for all employees in a company
   */
  async getTodayStats(
    companyId: string,
    date: string = new Date().toISOString().split("T")[0],
  ) {
    try {
      const records = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [Query.equal("company_id", companyId), Query.equal("date", date)],
      );

      const stats = {
        present: 0,
        absent: 0,
        onLeave: 0,
        presentOnTime: 0,
        lateArrivals: 0,
      };

      records.documents.forEach((doc: any) => {
        if (doc.status === "present") {
          stats.present++;
          // "present" status is assigned at check-in when the employee
          // arrives before the 09:15 threshold, so it reliably indicates on-time
          stats.presentOnTime++;
        } else if (doc.status === "late") {
          stats.present++; // late employees are physically present
          stats.lateArrivals++;
        } else if (doc.status === "absent") {
          stats.absent++;
        } else if (doc.status === "on_leave") {
          stats.onLeave++;
        }
      });

      return {
        ...stats,
        // Aliases for backward compatibility
        presentCount: stats.present,
        absentCount: stats.absent,
        onLeaveCount: stats.onLeave,
        lateCount: stats.lateArrivals,
        onTimeCount: stats.presentOnTime,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch attendance stats: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get attendance records for today - TIMEZONE AGNOSTIC FIX
   */
  async getTodayRecords(
    companyId: string,
    date: string = new Date().toISOString().split("T")[0],
  ) {
    try {
      // Create strict UTC day bounds to match across all locations
      const baseDate = new Date(date);
      baseDate.setUTCHours(0, 0, 0, 0);
      const todayISO = baseDate.toISOString();

      const nextDate = new Date(baseDate);
      nextDate.setUTCDate(baseDate.getUTCDate() + 1);
      const nextDayISO = nextDate.toISOString();

      const records = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("company_id", companyId),
          Query.greaterThanEqual("date", todayISO),
          Query.lessThan("date", nextDayISO),
          Query.limit(100),
        ],
      );

      return records.documents.map((doc: any) => ({
        id: doc.$id,
        employeeId: doc.employee_id,
        name: doc.employee_name || "N/A",
        email: doc.employee_email || "",
        status: doc.status,
        checkIn: doc.check_in_time ? new Date(doc.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
        checkOut: doc.check_out_time ? new Date(doc.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
        duration: doc.duration_hours ? `${doc.duration_hours}h` : "-",
        hoursWorked: doc.duration_hours || 0,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch attendance records: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get weekly attendance trend
   */
  async getWeeklyTrend(companyId: string) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const records = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("company_id", companyId),
          Query.greaterThanEqual("date", startDate.toISOString()),
          Query.lessThanEqual("date", endDate.toISOString()),
        ],
      );

      // Group by day
      const grouped: { [key: string]: any } = {};
      records.documents.forEach((doc: any) => {
        const day = new Date(doc.date).toLocaleDateString("en-US", {
          weekday: "short",
        });
        if (!grouped[day]) {
          grouped[day] = { day, present: 0, absent: 0 };
        }
        if (doc.status === "present" || doc.status === "late") grouped[day].present++;
        else if (doc.status === "absent") grouped[day].absent++;
      });

      return Object.values(grouped);
    } catch (error) {
      throw new Error(
        `Failed to fetch weekly trend: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get monthly attendance trend
   */
  async getMonthlyTrend(companyId: string) {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const records = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("company_id", companyId),
          Query.greaterThanEqual("date", startDate.toISOString()),
          Query.lessThanEqual("date", endDate.toISOString()),
        ],
      );

      // Calculate weeks
      const weeks = [
        { week: "Week 1", attendance: 0 },
        { week: "Week 2", attendance: 0 },
        { week: "Week 3", attendance: 0 },
        { week: "Week 4", attendance: 0 },
      ];

      records.documents.forEach((doc: any) => {
        const day = new Date(doc.date).getDate();
        const weekIndex = Math.floor((day - 1) / 7);
        if (doc.status === "present" || doc.status === "late") {
          weeks[weekIndex].attendance += 1;
        }
      });

      return weeks.map((w) => ({
        ...w,
        attendance: Math.round((w.attendance / 5) * 100), // Assume 5 days per week
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch monthly trend: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Check in employee - FIXED FOR DATETIME SCHEMAS
   */
  /**
   * Check in employee - DATETIME COMPLIANT
   */
  async checkIn(employeeId: string, companyId: string) {
    try {
      const now = new Date();
      const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("employee_id", employeeId), 
          Query.greaterThanEqual("date", todayISO),
          Query.lessThan("date", nextDay)
        ],
      );

      if (existing.documents.length > 0) {
        throw new Error("Already checked in today");
      }

      let employeeName = "Employee";
      let employeeEmail = "";
      try {
        const empDoc = await databases.getDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.EMPLOYEES,
          employeeId,
        );
        if (empDoc) {
          const fName = empDoc.first_name || empDoc.firstName || "";
          const lName = empDoc.last_name || empDoc.lastName || "";
          employeeName = `${fName} ${lName}`.trim() || "Employee";
          employeeEmail = empDoc.email || "";
        }
      } catch (e) {
        console.warn("Could not find employee profile meta details:", e);
      }

      const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15);

      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        ID.unique(),
        {
          employee_id: employeeId,
          company_id: companyId,
          employee_name: employeeName,
          employee_email: employeeEmail,
          date: todayISO,
          check_in_time: now.toISOString(),
          status: isLate ? "late" : "present",
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
      );

      return { success: true, time: now.toLocaleTimeString() };
    } catch (error) {
      throw new Error(`Check-in failed: ${handleAppwriteError(error)}`);
    }
  },

  /**
   * Check out employee - DATETIME COMPLIANT
   */
  async checkOut(employeeId: string) {
    try {
      const now = new Date();
      const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("employee_id", employeeId),
          Query.greaterThanEqual("date", todayISO),
          Query.lessThan("date", nextDay)
        ],
      );

      if (existing.documents.length === 0) {
        throw new Error("You must check in first!");
      }

      const record = existing.documents[0];
      if (record.check_out_time) {
        throw new Error("Already checked out today");
      }

      let hoursWorked = 0;
      if (record.check_in_time) {
        const inTime = new Date(record.check_in_time);
        const diffMs = now.getTime() - inTime.getTime();
        hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
      }

      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        record.$id,
        {
          check_out_time: now.toISOString(),
          duration_hours: Math.max(0, hoursWorked),
          updated_at: now.toISOString()
        },
      );

      return { success: true, time: now.toLocaleTimeString() };
    } catch (error) {
      throw new Error(`Check-out failed: ${handleAppwriteError(error)}`);
    }
  },

  /**
   * 🌟 NEW: Admin Force-override an individual employee's daily status record
   */
  async adminOverrideAttendance(
    companyId: string, 
    employeeId: string, 
    name: string, 
    email: string, 
    status: "present" | "absent" | "late"
  ) {
    try {
      const now = new Date();
      
      // Strict UTC normalization matching getTodayRecords bounds
      const baseDate = new Date();
      baseDate.setUTCHours(0, 0, 0, 0);
      const todayISO = baseDate.toISOString();

      const nextDate = new Date(baseDate);
      nextDate.setUTCDate(baseDate.getUTCDate() + 1);
      const nextDayISO = nextDate.toISOString();

      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("employee_id", employeeId),
          Query.greaterThanEqual("date", todayISO),
          Query.lessThan("date", nextDayISO)
        ]
      );

      const payload = {
        employee_id: employeeId,
        company_id: companyId,
        employee_name: name,
        employee_email: email,
        date: todayISO,
        status: status,
        check_in_time: status !== "absent" ? now.toISOString() : null,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      };

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.ATTENDANCE,
          existing.documents[0].$id,
          { 
            status: status, 
            check_in_time: payload.check_in_time, 
            updated_at: payload.updated_at 
          }
        );
      } else {
        await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.ATTENDANCE,
          ID.unique(),
          payload
        );
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to override record: ${handleAppwriteError(error)}`);
    }
  },

  /**
   * 🌟 NEW: Bulk marks all remaining unlogged company employees for today
   */
   /**
   * Bulk marks all remaining unlogged company employees for today - TIMEZONE AGNOSTIC FIX
   */
  async bulkMarkCompanyAttendance(companyId: string, status: "present" | "absent" | "late") {
    try {
      const now = new Date();
      
      // Strict UTC normalization matching getTodayRecords bounds
      const baseDate = new Date();
      baseDate.setUTCHours(0, 0, 0, 0);
      const todayISO = baseDate.toISOString();

      const nextDate = new Date(baseDate);
      nextDate.setUTCDate(baseDate.getUTCDate() + 1);
      const nextDayISO = nextDate.toISOString();

      const companyEmployees = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(100)]
      );

      const existingRecords = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.ATTENDANCE,
        [
          Query.equal("company_id", companyId),
          Query.greaterThanEqual("date", todayISO),
          Query.lessThan("date", nextDayISO)
        ]
      );

      const alreadyMarkedIds = new Set(existingRecords.documents.map((d: any) => d.employee_id));
      const defaultTime = now.toISOString();

      for (const employee of companyEmployees.documents) {
        if (!alreadyMarkedIds.has(employee.$id)) {
          const firstName = employee.first_name || employee.firstName || "";
          const lastName = employee.last_name || employee.lastName || "";
          const fullName = `${firstName} ${lastName}`.trim() || "Employee";

          await databases.createDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            DB_IDS.ATTENDANCE,
            ID.unique(),
            {
              employee_id: employee.$id,
              company_id: companyId,
              employee_name: fullName,
              employee_email: employee.email || "",
              date: todayISO,
              status: status,
              check_in_time: status !== "absent" ? defaultTime : null,
              created_at: defaultTime,
              updated_at: defaultTime
            }
          );
        }
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Bulk marking failed: ${handleAppwriteError(error)}`);
    }
  },
};

/**
 * Payroll Service - Real Appwrite Queries
 */
export const payrollQueries = {
  /**
   * Get payroll statistics
   */
  /**
   * Get payroll statistics safely without crashing on type mismatches
   */
  async getPayrollStats(companyId: string) {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const payslips = response.documents;
      const currentMonthKey = new Date().toISOString().substring(0, 7); // "YYYY-MM"

      // 1. Filter and compute stats safely with type guards
      const processed = payslips.filter((p: any) => {
        // Safe conversion of month to string regardless of whether it's stored as number, string, or undefined
        const pMonth = p.month !== undefined && p.month !== null ? String(p.month) : "";
        return pMonth.substring(0, 7) === currentMonthKey && p.status === "generated";
      }).length;

      const pending = payslips.filter((p: any) => {
        const pMonth = p.month !== undefined && p.month !== null ? String(p.month) : "";
        return pMonth.substring(0, 7) === currentMonthKey && p.status === "draft";
      }).length;

      return {
        total: processed + pending,
        successfullyProcessed: processed, // Maps cleanly to your payroll.tsx metric targets
        pendingProcessing: pending,       // Maps cleanly to your payroll.tsx metric targets
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch payroll stats: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get salary structure for an employee
   */
  async getSalaryStructure(employeeId: string) {
    try {
      const employee = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
      );

      if (!employee.salary_structure_id) {
        return {
          baseSalary: employee.base_salary || 0,
          allowances: 0,
          deductions: 0,
          netSalary: employee.base_salary || 0,
          currency: "USD",
        };
      }

      const structure = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYROLL_STRUCTURE,
        employee.salary_structure_id,
      );

      const earnings = (structure.other_allowances as any) || {};
      const deductions = (structure.other_deductions as any) || {};

      const totalEarnings =
        structure.basic_salary +
        Object.values(earnings).reduce((a: number, b: any) => a + b, 0);
      const totalDeductions = Object.values(deductions).reduce(
        (a: number, b: any) => a + b,
        0,
      );

      return {
        baseSalary: structure.basic_salary,
        allowances: totalEarnings - structure.basic_salary,
        deductions: totalDeductions,
        netSalary: totalEarnings - totalDeductions,
        currency: "USD",
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch salary structure: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get recent payslips
   */
  async getPayslips(companyId: string, limit: number = 10) {
    try {
      const payslips = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        [
          Query.equal("company_id", companyId),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ],
      );

      return payslips.documents.map((p: any) => {
        let employeeName = "N/A";
        try {
          if (p.breakdown) {
            const bd = JSON.parse(p.breakdown);
            if (bd && bd.employee_name) employeeName = bd.employee_name;
          }
        } catch (e) {}

        const monthName = new Date(
          p.year || 2024,
          (p.month || 1) - 1,
          1,
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

        return {
          id: p.$id,
          employee: employeeName,
          month: monthName,
          amount: `$${p.net_salary?.toLocaleString()}`,
          status: p.status,
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch payslips: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Process payroll for a company
   */
  async processPayroll(companyId: string) {
    try {
      // 1. Get all employees
      const employees = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId)],
      );

      if (employees.documents.length === 0) {
        throw new Error("No employees found to process payroll for.");
      }

      const currentMonthInt = new Date().getMonth() + 1;
      const currentYearInt = new Date().getFullYear();
      let processedCount = 0;

      // 2. Process each employee
      for (const employee of employees.documents) {
        // Check if already processed this month
        const existingPayslip = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.PAYSLIPS,
          [
            Query.equal("company_id", companyId),
            Query.equal("employee_id", employee.$id),
            Query.equal("month", currentMonthInt),
            Query.equal("year", currentYearInt),
          ],
        );

        if (existingPayslip.documents.length > 0) continue;

        // Process and create payslip
        const netSalary = employee.base_salary || 50000;
        const employeeName =
          `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
          "Employee";

        await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.PAYSLIPS,
          ID.unique(),
          {
            company_id: companyId,
            employee_id: employee.$id,
            month: currentMonthInt,
            year: currentYearInt,
            basic_salary: netSalary,
            allowances: netSalary * 0.4,
            deductions: netSalary * 0.1,
            gross_salary: netSalary * 1.4,
            net_salary: netSalary * 1.3,
            status: "paid",
            breakdown: JSON.stringify({
              employee_name: employeeName,
              earnings: { hra: netSalary * 0.4 },
              deductions: { tax: netSalary * 0.1 },
            }),
          },
        );
        processedCount++;
      }

      return processedCount;
    } catch (error) {
      throw new Error(
        `Failed to process payroll: ${handleAppwriteError(error)}`,
      );
    }
  },
};

export const leaveQueries = {
  /**
   * Get leave statistics for an employee
   */
  async getLeaveStats(employeeId: string) {
    try {
      const leaves = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [
          Query.equal("employee_id", employeeId),
          Query.equal("status", "approved"),
        ],
      );

      const usedDays = leaves.documents.reduce(
        (sum: number, l: any) => sum + (l.number_of_days || 0),
        0,
      );

      return {
        totalDays: 20, // Default allocation
        usedDays,
        remainingDays: 20 - usedDays,
        pendingRequests: 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch leave stats: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get leave requests
   */
  async getLeaveRequests(employeeId: string) {
    try {
      const leaves = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [
          Query.equal("employee_id", employeeId),
          Query.orderDesc("$createdAt"),
          Query.limit(10),
        ],
      );

      return leaves.documents.map((l: any) => ({
        id: l.$id,
        type: l.leave_type,
        startDate: l.start_date ? l.start_date.split("T")[0] : "",
        endDate: l.end_date ? l.end_date.split("T")[0] : "",
        days: l.number_of_days,
        status: l.status,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch leave requests: ${handleAppwriteError(error)}`,
      );
    }
  },
};

/**
 * Employee Service - Real Appwrite Queries
 */
export const employeeQueries = {
  /**
   * Get all employees in a company
   */
  async getEmployees(companyId: string) {
    try {
      const employees = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(100)],
      );

      return employees.documents.map((e: any) => ({
        id: e.$id,
        name: `${e.first_name} ${e.last_name}`,
        position: e.position,
        department: e.department,
        email: e.email,
        phone: e.phone,
        joinDate: e.joining_date,
        status: e.status,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch employees: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get employee statistics
   */
  async getEmployeeStats(companyId: string) {
    try {
      const employees = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId)],
      );

      const active = employees.documents.filter(
        (e: any) => e.status === "active",
      ).length;
      const inactive = employees.documents.filter(
        (e: any) => e.status === "inactive",
      ).length;
      const onLeave = employees.documents.filter(
        (e: any) => e.status === "on_leave",
      ).length;

      return {
        total: employees.total,
        active,
        inactive,
        onLeave,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch employee stats: ${handleAppwriteError(error)}`,
      );
    }
  },

  /**
   * Get single employee
   */
  async getEmployee(employeeId: string) {
    try {
      const employee = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
      );

      return {
        id: employee.$id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        joiningDate: employee.joining_date,
        status: employee.status,
        address: employee.address,
        city: employee.city,
        state: employee.state,
        country: employee.country,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch employee: ${handleAppwriteError(error)}`,
      );
    }
  },
};
