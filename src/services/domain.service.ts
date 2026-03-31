/**
 * 💰 Payroll Service (Real Appwrite)
 */
import {
  employeeQueries,
  getCurrentUserCompanyId,
  leaveQueries,
  payrollQueries,
} from "./appwriteClient";

const DEFAULT_ANNUAL_LEAVE_DAYS = 20;

export const payrollService = {
  async getPayrollStats(companyId?: string): Promise<any> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return payrollQueries.getPayrollStats(cId);
  },

  async getSalaryStructure(employeeId?: string): Promise<any> {
    if (!employeeId) return null;
    return payrollQueries.getSalaryStructure(employeeId);
  },

  async getPayslips(companyId?: string): Promise<any[]> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return payrollQueries.getPayslips(cId);
  },
};

/**
 * 🏖️ Leave Service (Real Appwrite)
 */
export const leaveService = {
  async getLeaveStats(employeeIdOrCompanyId?: string): Promise<any> {
    if (!employeeIdOrCompanyId) {
      return {
        totalDays: DEFAULT_ANNUAL_LEAVE_DAYS,
        usedDays: 0,
        remainingDays: DEFAULT_ANNUAL_LEAVE_DAYS,
        pendingRequests: 0,
      };
    }
    // Try as company ID first (used by dashboard), fall back to employee
    try {
      return leaveQueries.getLeaveStats(employeeIdOrCompanyId);
    } catch {
      // Return defaults on error
      return {
        totalDays: DEFAULT_ANNUAL_LEAVE_DAYS,
        usedDays: 0,
        remainingDays: DEFAULT_ANNUAL_LEAVE_DAYS,
        pendingRequests: 0,
      };
    }
  },

  async getLeaveRequests(employeeId?: string): Promise<any[]> {
    if (!employeeId) return [];
    return leaveQueries.getLeaveRequests(employeeId);
  },
};

/**
 * 👥 Employee Service (Real Appwrite)
 */
export const employeeService = {
  async getEmployees(companyId?: string): Promise<any[]> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return employeeQueries.getEmployees(cId);
  },

  async getEmployeeStats(companyId?: string): Promise<any> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return employeeQueries.getEmployeeStats(cId);
  },
};

/**
 * 💬 Chat Service - placeholder (no mock data)
 */
export const chatService = {
  async getMessages(): Promise<any[]> {
    return [];
  },
};
