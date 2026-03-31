export type EmploymentStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "terminated";

export interface SalaryStructure {
  basic: number;
  hra: number; // House Rent Allowance
  dearness?: number; // Dearness Allowance
  conveyance?: number;
  other_allowances?: number;
  pf?: number; // Provident Fund
  professionalTax?: number;
  incomeTax?: number;
  otherDeductions?: number;
}

export interface Employee {
  $id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  position: string;
  department: string;
  joiningDate: string;
  status: EmploymentStatus;
  salaryStructure?: SalaryStructure;
  documents?: string[]; // Document IDs
  avatar?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joiningDate: string;
  dateOfBirth?: string;
  employmentType?: string;
  baseSalary?: number;
  salaryStructure?: SalaryStructure;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {}
