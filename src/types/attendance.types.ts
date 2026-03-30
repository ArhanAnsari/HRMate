export type AttendanceStatus = "present" | "absent" | "half_day" | "on_leave";

export interface AttendanceRecord {
  $id: string;
  employeeId: string;
  companyId: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  duration?: number; // in minutes
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export interface CheckInRequest {
  employeeId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CheckOutRequest {
  attendanceRecordId: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}
