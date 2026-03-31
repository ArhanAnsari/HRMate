/**
 * 🤖 GEMINI AI SERVICE
 * Handles AI insights, salary explanations, and smart recommendations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class GeminiAIService {
  static async generateAIInsights(data: {
    totalEmployees: number;
    activeEmployees: number;
    attendanceRate: number;
    avgSalary: number;
    onLeaveCount: number;
    pendingLeavesCount: number;
  }): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `As an HR analytics expert, provide 2-3 key insights about this workforce data in a friendly, actionable way:
      
- Total Employees: ${data.totalEmployees}
- Active Today: ${data.activeEmployees}
- Attendance Rate: ${data.attendanceRate}%
- Average Salary: $${data.avgSalary}
- On Leave: ${data.onLeaveCount}
- Pending Leave Requests: ${data.pendingLeavesCount}

Keep response concise (2-3 sentences max).`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Failed to generate AI insights:", error);
      return "Unable to generate insights at this time.";
    }
  }

  static async explainSalary(
    salary: number,
    jobTitle: string,
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Explain this salary in simple, human terms for a ${jobTitle} earning $${salary} annually. Include what this salary might cover (rent, bills, etc.) in a major US city. Keep it to 2-3 sentences.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Failed to explain salary:", error);
      return "Unable to generate salary explanation at this time.";
    }
  }

  static async getSmartRecommendations(data: {
    lowAttendanceEmployees?: number;
    highTurnoverRate?: number;
    pendingLeavesCount?: number;
    unprocessedPayroll?: number;
  }): Promise<string[]> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const issues = [];
      if (data.lowAttendanceEmployees) {
        issues.push(
          `${data.lowAttendanceEmployees} employees with low attendance`,
        );
      }
      if (data.highTurnoverRate) {
        issues.push(`${data.highTurnoverRate}% turnover rate`);
      }
      if (data.pendingLeavesCount) {
        issues.push(`${data.pendingLeavesCount} pending leave requests`);
      }
      if (data.unprocessedPayroll) {
        issues.push(`${data.unprocessedPayroll} unprocessed payrolls`);
      }

      const prompt = `As an HR consultant, provide 3 specific, actionable recommendations to address these workplace issues: ${issues.join(", ")}. Format as a numbered list (1. 2. 3.).`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text.split("\n").filter((line) => line.trim().match(/^\d+\./));
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return [
        "Review attendance policies",
        "Conduct employee surveys",
        "Streamline payroll processes",
      ];
    }
  }

  static async chatWithAI(
    message: string,
    conversationHistory: Array<{ role: string; content: string }> = [],
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const chat = model.startChat({
        history: conversationHistory.map((msg) => ({
          role: msg.role as "user" | "model",
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error("Failed to chat with AI:", error);
      return "I apologize, I encountered an issue processing your request. Please try again.";
    }
  }

  static async analyzePayrollTrends(
    payrollData: Array<{ month: string; amount: number }>,
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const dataStr = payrollData
        .map((p) => `${p.month}: $${p.amount}`)
        .join(", ");

      const prompt = `Analyze this payroll trend data and provide brief insights: ${dataStr}. Mention any patterns, spikes, or concerns.`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Failed to analyze payroll trends:", error);
      return "Unable to analyze payroll trends at this time.";
    }
  }
}

export default GeminiAIService;
