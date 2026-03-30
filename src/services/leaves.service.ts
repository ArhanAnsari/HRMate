import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { LeaveCreateInput, LeaveRequest } from "../types";
import { databases } from "./appwrite";

export const leavesService = {
  /**
   * Apply for leave
   */
  async applyLeave(
    companyId: string,
    employeeId: string,
    data: LeaveCreateInput,
  ): Promise<LeaveRequest> {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        "unique()",
        {
          company_id: companyId,
          employee_id: employeeId,
          ...data,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );

      return response as unknown as LeaveRequest;
    } catch (error) {
      console.error("Failed to apply leave:", error);
      throw error;
    }
  },

  /**
   * Get all leave applications for an employee
   */
  async getEmployeeLeaves(
    companyId: string,
    employeeId: string,
  ): Promise<LeaveRequest[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [`company_id="${companyId}"`, `employee_id="${employeeId}"`],
      );

      return response.documents as unknown as LeaveRequest[];
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      throw error;
    }
  },

  /**
   * Get leave balance for employee
   */
  async getLeaveBalance(
    companyId: string,
    employeeId: string,
  ): Promise<{ total: number; used: number; remaining: number }> {
    try {
      const leaves = await this.getEmployeeLeaves(companyId, employeeId);

      const approvedLeaves = leaves.filter((l) => l.status === "approved");
      const usedDays = approvedLeaves.reduce(
        (sum, l) => sum + l.numberOfDays,
        0,
      );
      const totalDays = 20; // Default annual leave

      return {
        total: totalDays,
        used: usedDays,
        remaining: totalDays - usedDays,
      };
    } catch (error) {
      console.error("Failed to get leave balance:", error);
      throw error;
    }
  },

  /**
   * Get pending leave requests (for HR/Manager)
   */
  async getPendingLeaves(companyId: string): Promise<LeaveRequest[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [`company_id="${companyId}"`, `status="pending"`],
      );

      return response.documents as unknown as LeaveRequest[];
    } catch (error) {
      console.error("Failed to fetch pending leaves:", error);
      throw error;
    }
  },

  /**
   * Approve leave request
   */
  async approveLeave(
    leaveId: string,
    approverUserId: string,
    notes = "",
  ): Promise<LeaveRequest> {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        leaveId,
        {
          status: "approved",
          approved_by: approverUserId,
          approval_date: new Date().toISOString(),
          approval_notes: notes,
          updated_at: new Date().toISOString(),
        },
      );

      return response as unknown as LeaveRequest;
    } catch (error) {
      console.error("Failed to approve leave:", error);
      throw error;
    }
  },

  /**
   * Reject leave request
   */
  async rejectLeave(
    leaveId: string,
    approverUserId: string,
    reason: string,
  ): Promise<LeaveRequest> {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        leaveId,
        {
          status: "rejected",
          approved_by: approverUserId,
          approval_date: new Date().toISOString(),
          approval_notes: reason,
          updated_at: new Date().toISOString(),
        },
      );

      return response as unknown as LeaveRequest;
    } catch (error) {
      console.error("Failed to reject leave:", error);
      throw error;
    }
  },

  /**
   * Get leave statistics
   */
  async getLeaveStats(
    companyId: string,
  ): Promise<{ pending: number; approved: number; rejected: number }> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [`company_id="${companyId}"`],
      );

      const leaves = response.documents as unknown as LeaveRequest[];

      return {
        pending: leaves.filter((l) => l.status === "pending").length,
        approved: leaves.filter((l) => l.status === "approved").length,
        rejected: leaves.filter((l) => l.status === "rejected").length,
      };
    } catch (error) {
      console.error("Failed to get leave stats:", error);
      throw error;
    }
  },
};
