import { functions } from "./appwrite";
import { Employee, LeaveRequest, Payslip } from "../types";
import { ExecutionMethod } from "appwrite";

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

const callAiFunction = async (action: string, data: any) => {
  try {
    const result = await functions.createExecution(
      "ai-handler",
      JSON.stringify({ action, data }),
      false,
      "/",
      ExecutionMethod.POST,
    );
    const responseBody = JSON.parse(result.responseBody);
    if (!responseBody.success) {
      throw new Error(responseBody.error || "AI feature failed");
    }
    return responseBody.response; // For JSON strings like list, parse later if needed
  } catch (error) {
    console.error(`AI Task Error (${action}):`, error);
    throw error;
  }
};

export const aiService = {
  /**
   * Chat with AI HR Assistant
   */
  async chat(message: string, context: AIContext): Promise<string> {
    return callAiFunction("chat", { message, context });
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
    return callAiFunction("getInsights", data);
  },

  /**
   * Generate salary explanation
   */
  async explainSalary(payslip: Payslip, structure?: any): Promise<string> {
    return callAiFunction("explainSalary", { payslip, structure });
  },

  /**
   * Generate attendance insights
   */
  async getAttendanceInsights(stats: any): Promise<string> {
    return callAiFunction("getAttendanceInsights", { stats });
  },
};

