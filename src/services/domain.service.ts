/**
 * 💰 Payroll Service (Real Appwrite)
 */
import {
  employeeQueries,
  getCurrentUserCompanyId,
  leaveQueries,
  payrollQueries,
} from "./appwriteClient";

export const payrollService = {
  async getPayrollStats(): Promise<any> {
    const companyId = await getCurrentUserCompanyId();
    return payrollQueries.getPayrollStats(companyId);
  },

  async getSalaryStructure(employeeId?: string): Promise<any> {
    if (!employeeId) return null;
    return payrollQueries.getSalaryStructure(employeeId);
  },

  async getPayslips(): Promise<any[]> {
    const companyId = await getCurrentUserCompanyId();
    return payrollQueries.getPayslips(companyId);
  },
};

/**
 * 🏖️ Leave Service (Real Appwrite)
 */
export const leaveService = {
  async getLeaveStats(employeeId?: string): Promise<any> {
    if (!employeeId) {
      return { totalDays: 20, usedDays: 0, remainingDays: 20, pendingRequests: 0 };
    }
    return leaveQueries.getLeaveStats(employeeId);
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
  async getEmployees(): Promise<any[]> {
    const companyId = await getCurrentUserCompanyId();
    return employeeQueries.getEmployees(companyId);
  },

  async getEmployeeStats(): Promise<any> {
    const companyId = await getCurrentUserCompanyId();
    return employeeQueries.getEmployeeStats(companyId);
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

