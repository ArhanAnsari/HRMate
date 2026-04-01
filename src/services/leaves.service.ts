import { ID, Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { LeaveCreateInput, LeaveRequest } from "../types";
import { databases } from "./appwrite";

/** Map a raw Appwrite leaves document to the camelCase LeaveRequest interface */
const mapDocToLeaveRequest = (doc: any): LeaveRequest => ({
  $id: doc.$id,
  employeeId: doc.employee_id || "",
  companyId: doc.company_id || "",
  leaveType: doc.leave_type,
  startDate: doc.start_date ? doc.start_date.split("T")[0] : "",
  endDate: doc.end_date ? doc.end_date.split("T")[0] : "",
  numberOfDays: doc.number_of_days || 0,
  reason: doc.reason || "",
  status: doc.status || "pending",
  approvedBy: doc.approved_by,
  approvalDate: doc.approval_date,
  comments: doc.comments,
  createdAt: doc.created_at || doc.$createdAt || new Date().toISOString(),
  updatedAt: doc.updated_at || doc.$updatedAt || new Date().toISOString(),
});

/** Map camelCase LeaveCreateInput to snake_case Appwrite document fields */
const mapInputToLeaveDoc = (
  companyId: string,
  employeeId: string,
  data: LeaveCreateInput,
) => {
  const now = new Date().toISOString();
  return {
    company_id: companyId,
    employee_id: employeeId,
    leave_type: data.leaveType,
    start_date: new Date(data.startDate).toISOString(),
    end_date: new Date(data.endDate).toISOString(),
    number_of_days: data.numberOfDays,
    reason: data.reason,
    status: "pending",
    created_at: now,
    updated_at: now,
  };
};

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
        ID.unique(),
        mapInputToLeaveDoc(companyId, employeeId, data),
      );

      return mapDocToLeaveRequest(response);
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
        [
          Query.equal("company_id", companyId),
          Query.equal("employee_id", employeeId),
          Query.orderDesc("$createdAt"),
        ],
      );

      return response.documents.map(mapDocToLeaveRequest);
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
        [Query.equal("company_id", companyId), Query.orderDesc("$createdAt")],
      );

      return response.documents.map(mapDocToLeaveRequest);
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
          comments: notes,
          updated_at: new Date().toISOString(),
        },
      );

      return mapDocToLeaveRequest(response);
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
          comments: reason,
          updated_at: new Date().toISOString(),
        },
      );

      return mapDocToLeaveRequest(response);
    } catch (error) {
      console.error("Failed to reject leave:", error);
      throw error;
    }
  },

  /**
   * Cancel leave request
   */
  async cancelLeave(leaveId: string): Promise<LeaveRequest> {
    try {
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        leaveId,
        {
          status: "cancelled",
          updated_at: new Date().toISOString(),
        },
      );

      return mapDocToLeaveRequest(response);
    } catch (error) {
      console.error("Failed to cancel leave:", error);
      throw error;
    }
  },

  /**
   * Get leave statistics for a company
   */
  async getLeaveStats(
    companyId: string,
  ): Promise<{ pending: number; approved: number; rejected: number }> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.LEAVES,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const leaves = response.documents;

      return {
        pending: leaves.filter((l: any) => l.status === "pending").length,
        approved: leaves.filter((l: any) => l.status === "approved").length,
        rejected: leaves.filter((l: any) => l.status === "rejected").length,
      };
    } catch (error) {
      console.error("Failed to get leave stats:", error);
      throw error;
    }
  },
};
