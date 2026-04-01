import { attendanceQueries, getCurrentUserCompanyId } from "./appwriteClient";

export interface AttendanceRecord {
  employeeId?: string;
  email: any;
  hoursWorked: any;
  id: string;
  name: string;
  status: "present" | "absent" | "late" | "on_leave";
  checkIn: string;
  checkOut: string;
  duration: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  onLeave: number;
  presentOnTime: number;
  lateArrivals: number;
  // Aliases for backward compatibility
  presentCount?: number;
  absentCount?: number;
  onLeaveCount?: number;
  lateCount?: number;
  onTimeCount?: number;
}

export interface TrendData {
  day?: string;
  week?: string;
  present?: number;
  absent?: number;
  attendance?: number;
  value?: number;
}

export const attendanceService = {
  // Get today's attendance statistics
  async getTodayStats(companyId?: string): Promise<AttendanceStats> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return attendanceQueries.getTodayStats(cId);
  },

  // Get attendance records for today
  async getTodayRecords(companyId?: string): Promise<AttendanceRecord[]> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return attendanceQueries.getTodayRecords(cId) as unknown as Promise<
      AttendanceRecord[]
    >;
  },

  // Get weekly trend data
  async getWeeklyTrend(companyId?: string): Promise<TrendData[]> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return attendanceQueries.getWeeklyTrend(cId);
  },

  // Get monthly trend data
  async getMonthlyTrend(companyId?: string): Promise<TrendData[]> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return attendanceQueries.getMonthlyTrend(cId);
  },

  // Check in employee
  async checkIn(
    employeeId: string,
    companyId?: string,
  ): Promise<{ success: boolean; time: string }> {
    const cId = companyId || (await getCurrentUserCompanyId());
    return attendanceQueries.checkIn(employeeId, cId);
  },

  // Check out employee
  async checkOut(
    employeeId: string,
  ): Promise<{ success: boolean; time: string }> {
    return attendanceQueries.checkOut(employeeId);
  },
};
