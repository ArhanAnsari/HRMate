import { attendanceQueries, getCurrentUserCompanyId } from "./appwriteClient";

export interface AttendanceRecord {
  id: string;
  name: string;
  status: "present" | "absent" | "late";
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
  async getTodayStats(): Promise<AttendanceStats> {
    const companyId = await getCurrentUserCompanyId();
    return attendanceQueries.getTodayStats(companyId);
  },

  // Get attendance records for today
  async getTodayRecords(): Promise<AttendanceRecord[]> {
    const companyId = await getCurrentUserCompanyId();
    return attendanceQueries.getTodayRecords(companyId) as Promise<
      AttendanceRecord[]
    >;
  },

  // Get weekly trend data
  async getWeeklyTrend(): Promise<TrendData[]> {
    const companyId = await getCurrentUserCompanyId();
    return attendanceQueries.getWeeklyTrend(companyId);
  },

  // Get monthly trend data
  async getMonthlyTrend(): Promise<TrendData[]> {
    const companyId = await getCurrentUserCompanyId();
    return attendanceQueries.getMonthlyTrend(companyId);
  },

  // Check in employee
  async checkIn(
    employeeId: string,
  ): Promise<{ success: boolean; time: string }> {
    const companyId = await getCurrentUserCompanyId();
    return attendanceQueries.checkIn(employeeId, companyId);
  },

  // Check out employee
  async checkOut(
    employeeId: string,
  ): Promise<{ success: boolean; time: string }> {
    return attendanceQueries.checkOut(employeeId);
  },
};
