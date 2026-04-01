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

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  branchName?: string;
}

export interface Employee {
  $id: string;
  companyId: string;
  managerId?: string; // Relation to another Employee
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  position: string;
  department: string;
  joiningDate: string;
  status: EmploymentStatus;
  employmentType?: string;
  baseSalary?: number;
  salaryStructure?: SalaryStructure;
  documents?: string[]; // Document IDs
  avatar?: string;
  address?: string;
  panNumber?: string;
  aadharNumber?: string;
  bankDetails?: BankDetails;
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
  panNumber?: string;
  aadharNumber?: string;
  bankDetails?: BankDetails;
  managerId?: string;
}

export interface EmployeeUpdateInput extends Partial<EmployeeCreateInput> {
  status?: EmploymentStatus;
}
