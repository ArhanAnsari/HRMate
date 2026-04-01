/**
 * 🤖 GEMINI AI SERVICE
 * Handles AI insights, salary explanations, and smart recommendations
 */

import { ExecutionMethod } from "appwrite";
import { functions } from "./appwrite";

export interface AIInsightData {
  totalEmployees: number;
  activeEmployees: number;
  attendanceRate: number;
  avgSalary: number;
  onLeaveCount: number;
  pendingLeavesCount: number;
}

export interface SmartRecommendationData {
  lowAttendanceEmployees?: number;
  highTurnoverRate?: number;
  pendingLeavesCount?: number;
  unprocessedPayroll?: number;
}

export interface ConversationMessage {
  role: string;
  content: string;
}

class AIExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIExecutionError";
  }
}

const callAiFunction = async <T = any>(
  action: string,
  data: Record<string, any>,
): Promise<T> => {
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
      throw new AIExecutionError(responseBody.error || "AI feature failed");
    }
    return responseBody.response as T;
  } catch (error) {
    console.error(`[Gemini AI] Task Error (${action}):`, error);
    throw error;
  }
};

export class GeminiAIService {
  static async generateAIInsights(data: AIInsightData): Promise<string> {
    try {
      return await callAiFunction<string>("generateAIInsights", data);
    } catch (error) {
      return "Unable to generate insights at this time.";
    }
  }

  static async explainSalary(
    salary: number,
    jobTitle: string,
  ): Promise<string> {
    try {
      return await callAiFunction<string>("explainSalary", {
        salary,
        jobTitle,
      });
    } catch (error) {
      return "Unable to generate salary explanation at this time.";
    }
  }

  static async getSmartRecommendations(
    data: SmartRecommendationData,
  ): Promise<string[]> {
    try {
      const responseStr = await callAiFunction<string>(
        "getSmartRecommendations",
        data,
      );
      return JSON.parse(responseStr);
    } catch (error) {
      return [
        "Review attendance policies",
        "Conduct employee surveys",
        "Streamline payroll processes",
      ];
    }
  }

  static async chatWithAI(
    message: string,
    conversationHistory: ConversationMessage[] = [],
  ): Promise<string> {
    try {
      return await callAiFunction<string>("chatWithAI", {
        message,
        conversationHistory,
      });
    } catch (error) {
      return "I apologize, I encountered an issue processing your request. Please try again.";
    }
  }

  static async analyzePayrollTrends(
    payrollData: Array<{ month: string; amount: number }>,
  ): Promise<string> {
    try {
      return await callAiFunction<string>("analyzePayrollTrends", {
        payrollData,
      });
    } catch (error) {
      return "Unable to analyze payroll trends at this time.";
    }
  }
}

export default GeminiAIService;
