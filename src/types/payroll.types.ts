export interface PayrollCalculation {
  employeeId: string;
  grossSalary: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  breakdown: {
    components: { [key: string]: number };
  };
}

export interface Payslip {
  $id: string;
  employeeId: string;
  companyId: string;
  month: number;
  year: number;
  payrollId: string;
  calculation: PayrollCalculation;
  pdfUrl?: string;
  status: "draft" | "generated" | "sent";
  createdAt: string;
  updatedAt: string;
}

export interface Payroll {
  $id: string;
  companyId: string;
  month: number;
  year: number;
  payslips: string[]; // Payslip IDs
  totalAmount: number;
  status: "draft" | "processed" | "locked";
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollProcessRequest {
  month: number;
  year: number;
}
