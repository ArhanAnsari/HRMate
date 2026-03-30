// Route paths
export const Routes = {
  // Auth routes
  AUTH_LOGIN: "/(auth)/login",
  AUTH_SIGNUP: "/(auth)/signup",
  AUTH_RESET_PASSWORD: "/(auth)/reset-password",

  // Dashboard routes
  DASHBOARD: "/(dashboard)",
  DASHBOARD_HOME: "/(dashboard)",

  // Employee routes
  EMPLOYEES: "/(dashboard)/employees",
  EMPLOYEE_ADD: "/(dashboard)/employees/add",
  EMPLOYEE_DETAIL: (id: string) => `/(dashboard)/employees/${id}`,

  // Attendance routes
  ATTENDANCE: "/(dashboard)/attendance",
  ATTENDANCE_DETAIL: (id: string) => `/(dashboard)/attendance/${id}`,

  // Leave routes
  LEAVES: "/(dashboard)/leaves",
  LEAVE_APPLY: "/(dashboard)/leaves/apply",

  // Payroll routes
  PAYROLL: "/(dashboard)/payroll",
  PAYROLL_STRUCTURE: "/(dashboard)/payroll/structure",
  PAYROLL_HISTORY: "/(dashboard)/payroll/history",
  PAYROLL_DETAIL: (id: string) => `/(dashboard)/payroll/${id}`,

  // Chat/AI routes
  CHAT: "/(dashboard)/chat",

  // Insights routes
  INSIGHTS: "/(dashboard)/insights",

  // Settings routes
  SETTINGS: "/(dashboard)/settings",

  // Profile routes
  PROFILE: "/(dashboard)/profile",
};

// Navigation params
export const NavigationParams = {
  EMPLOYEE_ID: "employeeId",
  PAYROLL_ID: "payrollId",
  LEAVE_ID: "leaveId",
  ATTENDANCE_ID: "attendanceId",
};
