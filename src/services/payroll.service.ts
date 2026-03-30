import { Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { Payslip, SalaryStructure } from "../types";
import { databases } from "./appwrite";

export const payrollService = {
  /**
   * Create or update salary structure
   */
  async createSalaryStructure(
    companyId: string,
    data: SalaryStructure,
  ): Promise<SalaryStructure> {
    try {
      // Check if structure exists
      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYROLL_STRUCTURE,
        [Query.equal("company_id", companyId)],
      );

      if (existing.documents.length > 0) {
        // Update existing
        return (await databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          DB_IDS.PAYROLL_STRUCTURE,
          existing.documents[0].$id,
          data,
        )) as unknown as SalaryStructure;
      }

      // Create new
      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYROLL_STRUCTURE,
        "unique()",
        {
          company_id: companyId,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );

      return response as unknown as SalaryStructure;
    } catch (error) {
      console.error("Failed to create salary structure:", error);
      throw error;
    }
  },

  /**
   * Get all salary structures for company
   */
  async getSalaryStructures(companyId: string): Promise<SalaryStructure[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYROLL_STRUCTURE,
        [Query.equal("company_id", companyId)],
      );

      return response.documents as unknown as SalaryStructure[];
    } catch (error) {
      console.error("Failed to fetch salary structures:", error);
      throw error;
    }
  },

  /**
   * Calculate salary
   */
  calculateSalary(structure: SalaryStructure): Record<string, any> {
    // Calculate earnings
    const basicSalary = structure.basic;
    const hra = structure.hra || 0;
    const da = structure.dearness || 0;
    const otherAllowances = structure.other_allowances
      ? Object.values(structure.other_allowances || {}).reduce(
          (a: number, b) => a + (b as number),
          0,
        )
      : 0;

    const grossEarnings = basicSalary + hra + da + otherAllowances;

    // Calculate deductions
    const pf = structure.pf ? structure.pf : 0;
    const professionalTax = structure.professionalTax
      ? structure.professionalTax
      : 0;
    const incomeTax = structure.incomeTax ? structure.incomeTax : 0;
    const otherDeductions = structure.otherDeductions
      ? structure.otherDeductions
      : 0;

    const totalDeductions = pf + professionalTax + incomeTax + otherDeductions;
    const netSalary = grossEarnings - totalDeductions;

    return {
      basic_salary: basicSalary,
      earnings: {
        hra,
        da,
        conveyance: structure.conveyance,
      },
      gross_salary: grossEarnings,
      deductions: {
        pf,
        professionalTax,
        incomeTax,
        otherDeductions,
      },
      total_deductions: totalDeductions,
      net_salary: netSalary,
    };
  },

  /**
   * Generate payslip
   */
  async generatePayslip(
    companyId: string,
    employeeId: string,
    month: Date,
    salaryData: Record<string, any>,
  ): Promise<Payslip> {
    try {
      const monthKey = month.toISOString().split("T")[0].substring(0, 7); // YYYY-MM

      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        "unique()",
        {
          company_id: companyId,
          employee_id: employeeId,
          month: monthKey,
          basic_salary: salaryData.basic_salary,
          earnings: salaryData.earnings,
          gross_salary: salaryData.gross_salary,
          deductions: salaryData.deductions,
          net_salary: salaryData.net_salary,
          status: "generated",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      );

      return response as unknown as Payslip;
    } catch (error) {
      console.error("Failed to generate payslip:", error);
      throw error;
    }
  },

  /**
   * Get payslips for employee
   */
  async getPayslips(companyId: string, employeeId: string): Promise<Payslip[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        [
          Query.equal("company_id", companyId),
          Query.equal("employee_id", employeeId),
          Query.orderDesc("month"),
        ],
      );

      return response.documents as unknown as Payslip[];
    } catch (error) {
      console.error("Failed to fetch payslips:", error);
      throw error;
    }
  },

  /**
   * Get payslip for specific month
   */
  async getPayslipByMonth(
    employeeId: string,
    month: Date,
  ): Promise<Payslip | null> {
    try {
      const monthKey = month.toISOString().split("T")[0].substring(0, 7);
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        [
          Query.equal("employee_id", employeeId),
          Query.equal("month", monthKey),
        ],
      );

      if (response.documents.length === 0) return null;
      return response.documents[0] as unknown as Payslip;
    } catch (error) {
      console.error("Failed to fetch payslip:", error);
      return null;
    }
  },

  /**
   * Get payroll statistics
   */
  async getPayrollStats(
    companyId: string,
  ): Promise<{ total: number; processed: number; pending: number }> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.PAYSLIPS,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const payslips = response.documents as unknown as Payslip[];

      return {
        total: payslips.length,
        processed: payslips.filter(
          (p) => p.status === "generated" || p.status === "sent",
        ).length,
        pending: payslips.filter((p) => p.status === "draft").length,
      };
    } catch (error) {
      console.error("Failed to get payroll stats:", error);
      throw error;
    }
  },
};
