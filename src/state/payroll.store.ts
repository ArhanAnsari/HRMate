import { create } from "zustand";
import { payrollService } from "../services/payroll.service";
import { Payslip, SalaryStructure } from "../types";

interface PayrollStats {
  total: number;
  processed: number;
  pending: number;
}

interface PayrollStore {
  structures: SalaryStructure[];
  payslips: Payslip[];
  stats: PayrollStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createSalaryStructure: (
    companyId: string,
    data: SalaryStructure,
  ) => Promise<void>;
  fetchSalaryStructures: (companyId: string) => Promise<void>;
  generatePayslip: (
    companyId: string,
    employeeId: string,
    month: Date,
    salaryData: Record<string, any>,
  ) => Promise<void>;
  fetchPayslips: (companyId: string, employeeId: string) => Promise<void>;
  fetchPayrollStats: (companyId: string) => Promise<void>;
  clearError: () => void;
}

export const usePayrollStore = create<PayrollStore>((set, get) => ({
  structures: [],
  payslips: [],
  stats: null,
  isLoading: false,
  error: null,

  createSalaryStructure: async (companyId: string, data: SalaryStructure) => {
    set({ isLoading: true, error: null });
    try {
      const structure = await payrollService.createSalaryStructure(
        companyId,
        data,
      );
      const { structures } = get();
      set({
        structures: [data, ...structures],
        isLoading: false,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create structure";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchSalaryStructures: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const structures = await payrollService.getSalaryStructures(companyId);
      set({ structures, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch structures";
      set({ error: errorMsg, isLoading: false });
    }
  },

  generatePayslip: async (
    companyId: string,
    employeeId: string,
    month: Date,
    salaryData: Record<string, any>,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const payslip = await payrollService.generatePayslip(
        companyId,
        employeeId,
        month,
        salaryData,
      );
      const { payslips } = get();
      set({ payslips: [payslip, ...payslips], isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate payslip";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  fetchPayslips: async (companyId: string, employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const payslips = await payrollService.getPayslips(companyId, employeeId);
      set({ payslips, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch payslips";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchPayrollStats: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stats = await payrollService.getPayrollStats(companyId);
      set({ stats, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch stats";
      set({ error: errorMsg, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
