import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_CONFIG } from "../config/env";
import { Employee, LeaveRequest, Payslip } from "../types";

// Initialize Gemini AI
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_CONFIG.API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_CONFIG.API_KEY);
}

interface AIContext {
  user?: {
    name: string;
    position: string;
    department: string;
    email: string;
  };
  employees?: Employee[];
  payslips?: Payslip[];
  leaves?: LeaveRequest[];
  attendanceStats?: any;
}

export const aiService = {
  /**
   * Chat with AI HR Assistant
   */
  async chat(message: string, context: AIContext): Promise<string> {
    if (!genAI) {
      throw new Error(
        "Gemini API is not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in .env",
      );
    }

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

      // Build context string
      let contextStr = `You are an HR Assistant. Answer questions helpfully and professionally.`;

      if (context.user) {
        contextStr += `\n\nCurrent User:
- Name: ${context.user.name}
- Position: ${context.user.position}
- Department: ${context.user.department}
- Email: ${context.user.email}`;
      }

      if (context.leaves && context.leaves.length > 0) {
        const approved = context.leaves.filter((l) => l.status === "approved");
        const used = approved.reduce((sum, l) => sum + l.numberOfDays, 0);
        contextStr += `\n\nLeave Information:
- Total Annual Leaves: 20 days
- Used: ${used} days
- Remaining: ${20 - used} days
- Recent Leave Requests: ${approved.map((l) => `${l.leaveType} (${l.startDate})`).join(", ") || "None"}`;
      }

      if (context.payslips && context.payslips.length > 0) {
        const latest = context.payslips[0];
        contextStr += `\n\nSalary Information:
- Gross Salary: ₹${latest.calculation.grossSalary}
- Deductions: ₹${latest.calculation.deductions}
- Net Salary: ₹${latest.calculation.netSalary}
- Breakdown: ${JSON.stringify(latest.calculation.breakdown)}`;
      }

      if (context.attendanceStats) {
        contextStr += `\n\nAttendance (This Month):
- Present: ${context.attendanceStats.present} days
- Absent: ${context.attendanceStats.absent} days
- Half Days: ${context.attendanceStats.halfDay}
- On Leave: ${context.attendanceStats.onLeave}`;
      }

      const prompt = `${contextStr}\n\nUser Question: ${message}\n\nProvide a helpful and accurate answer based on the context provided.`;

      const result = await model.generateContent(prompt);
      const response = result.response;

      return response.text();
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  },

  /**
   * Get AI Insights
   */
  async getInsights(data: {
    employees?: Employee[];
    payslips?: Payslip[];
    leaves?: LeaveRequest[];
    attendance?: any[];
  }): Promise<string> {
    if (!genAI) {
      throw new Error("Gemini API is not configured");
    }

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

      let analyticsContext =
        "Provide 3-4 key HR insights based on this data:\n";

      if (data.employees) {
        analyticsContext += `\n- Total Employees: ${data.employees.length}`;
        const byDept = data.employees.reduce(
          (acc, e) => {
            acc[e.department] = (acc[e.department] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        );
        analyticsContext += `\n- Employees by Department: ${JSON.stringify(
          byDept,
        )}`;
      }

      if (data.leaves && data.leaves.length > 0) {
        const pending = data.leaves.filter(
          (l) => l.status === "pending",
        ).length;
        const approved = data.leaves.filter(
          (l) => l.status === "approved",
        ).length;
        analyticsContext += `\n- Leave Requests: ${pending} pending, ${approved} approved`;
      }

      if (data.attendance) {
        const avgAttendance = Math.round(
          (data.attendance.filter((a) => a.status === "present").length /
            data.attendance.length) *
            100,
        );
        analyticsContext += `\n- Average Attendance Rate: ${avgAttendance}%`;
      }

      const result = await model.generateContent(analyticsContext);
      return result.response.text();
    } catch (error) {
      console.error("AI Insights Error:", error);
      throw error;
    }
  },

  /**
   * Generate salary explanation
   */
  async explainSalary(payslip: Payslip, structure?: any): Promise<string> {
    if (!genAI) {
      throw new Error("Gemini API is not configured");
    }

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

      const prompt = `
Provide a clear explanation of this payslip breakdown in a friendly tone:

Gross Salary: ₹${payslip.calculation.grossSalary}
Earnings: ${JSON.stringify(payslip.calculation.breakdown)}
Deductions: ₹${payslip.calculation.deductions}
Net Salary: ₹${payslip.calculation.netSalary}

Explain each component and what it means.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Salary Explanation Error:", error);
      throw error;
    }
  },

  /**
   * Generate attendance insights
   */
  async getAttendanceInsights(stats: any): Promise<string> {
    if (!genAI) {
      throw new Error("Gemini API is not configured");
    }

    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

      const totalDays =
        stats.present + stats.absent + stats.halfDay + stats.onLeave;
      const attendanceRate = Math.round((stats.present / totalDays) * 100);

      const prompt = `
Analyze this attendance data and provide insights:
- Present: ${stats.present} days (${attendanceRate}%)
- Absent: ${stats.absent} days
- Half Days: ${stats.halfDay}
- On Leave: ${stats.onLeave}

Provide 2-3 observations and any recommendations.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Attendance Insights Error:", error);
      throw error;
    }
  },
};
