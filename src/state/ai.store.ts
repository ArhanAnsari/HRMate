import { create } from "zustand";
import { aiService } from "../services/ai.service";
import { Employee, LeaveRequest, Payslip } from "../types";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  // Context for AI
  userContext?: {
    name: string;
    position: string;
    department: string;
    email: string;
  };
  employees?: Employee[];
  payslips?: Payslip[];
  leaves?: LeaveRequest[];
  attendanceStats?: any;

  // Actions
  setContext: (context: any) => void;
  sendMessage: (message: string) => Promise<void>;
  getInsights: () => Promise<string>;
  explainSalary: (payslip: Payslip) => Promise<string>;
  getAttendanceInsights: (stats: any) => Promise<string>;
  clearChat: () => void;
  clearError: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  setContext: (context) => set(context),

  sendMessage: async (userMessage: string) => {
    set({ isLoading: true, error: null });

    try {
      const {
        messages,
        userContext,
        employees,
        payslips,
        leaves,
        attendanceStats,
      } = get();

      // Add user message to chat
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      set({ messages: [...messages, userMsg] });

      // Get AI response
      const response = await aiService.chat(userMessage, {
        user: userContext,
        employees,
        payslips,
        leaves,
        attendanceStats,
      });

      // Add AI response
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isLoading: false,
      }));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to get response";
      set({ error: errorMsg, isLoading: false });
    }
  },

  getInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const { employees, payslips, leaves, attendanceStats } = get();
      const insights = await aiService.getInsights({
        employees,
        payslips,
        leaves,
        attendance: attendanceStats ? [attendanceStats] : [],
      });

      return insights;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to get insights";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  explainSalary: async (payslip: Payslip) => {
    set({ isLoading: true, error: null });
    try {
      const explanation = await aiService.explainSalary(payslip);
      set({ isLoading: false });
      return explanation;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to explain salary";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  getAttendanceInsights: async (stats: any) => {
    set({ isLoading: true, error: null });
    try {
      const insights = await aiService.getAttendanceInsights(stats);
      set({ isLoading: false });
      return insights;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to get insights";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  clearChat: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));
