export type LeaveType = "sick" | "casual" | "paid" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveRequest {
  $id: string;
  employeeId: string;
  companyId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvalDate?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCreateInput {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
}

export interface LeaveApprovalInput {
  leaveRequestId: string;
  comments?: string;
  approved: boolean;
}

export interface EmployeeLeaveBalance {
  employeeId: string;
  balances: LeaveBalance[];
}
