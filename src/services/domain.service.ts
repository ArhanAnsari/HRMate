/**
 * 💰 Payroll Service
 */

import { mockPayrollData } from "./appwriteClient";

export const payrollService = {
  async getPayrollStats(): Promise<any> {
    return mockPayrollData.getPayroll();
  },

  async getSalaryStructure(): Promise<any> {
    return mockPayrollData.getSalaryStructure();
  },

  async getPayslips(): Promise<any[]> {
    return mockPayrollData.getPayslips();
  },
};

/**
 * 🏖️ Leave Service
 */

export const leaveService = {
  async getLeaveStats(): Promise<any> {
    return {
      totalDays: 20,
      usedDays: 7,
      remainingDays: 13,
      pendingRequests: 2,
    };
  },

  async getLeaveRequests(): Promise<any[]> {
    return [
      {
        id: "1",
        type: "Vacation",
        startDate: "2025-01-10",
        endDate: "2025-01-13",
        days: 4,
        status: "approved",
      },
      {
        id: "2",
        type: "Sick Leave",
        startDate: "2025-01-20",
        days: 1,
        status: "pending",
      },
      {
        id: "3",
        type: "Personal",
        startDate: "2024-12-25",
        days: 2,
        status: "approved",
      },
    ];
  },
};

/**
 * 👥 Employee Service
 */

export const employeeService = {
  async getEmployees(): Promise<any[]> {
    return [
      {
        id: "1",
        name: "John Doe",
        position: "Senior Manager",
        department: "Operations",
        email: "john@hrmate.com",
        phone: "+1 234-567-8900",
        joinDate: "2022-01-15",
        status: "active",
      },
      {
        id: "2",
        name: "Jane Smith",
        position: "HR Lead",
        department: "Human Resources",
        email: "jane@hrmate.com",
        phone: "+1 234-567-8901",
        joinDate: "2021-06-01",
        status: "active",
      },
      {
        id: "3",
        name: "Mike Johnson",
        position: "Developer",
        department: "Engineering",
        email: "mike@hrmate.com",
        phone: "+1 234-567-8902",
        joinDate: "2023-03-10",
        status: "active",
      },
    ];
  },

  async getEmployeeStats(): Promise<any> {
    return { total: 29, active: 28, onLeave: 1, absent: 0 };
  },
};

/**
 * 💬 Chat Service
 */

export const chatService = {
  async getMessages(): Promise<any[]> {
    return [
      {
        id: "1",
        sender: "John Doe",
        content: "Hey team, check the Q1 roadmap",
        timestamp: "10:30 AM",
      },
      {
        id: "2",
        sender: "Jane Smith",
        content: "Thanks for sharing, reviewing now",
        timestamp: "10:32 AM",
      },
      {
        id: "3",
        sender: "Mike Johnson",
        content: "Looks good! Let's discuss in the standup",
        timestamp: "10:35 AM",
      },
    ];
  },
};
