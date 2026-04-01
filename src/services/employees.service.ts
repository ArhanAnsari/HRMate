import { ID, Query } from "appwrite";
import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "../types";
import { databases } from "./appwrite";

/** Map a raw Appwrite document to the camelCase Employee interface */
const mapDocToEmployee = (doc: any): Employee => ({
  $id: doc.$id,
  companyId: doc.company_id || "",
  firstName: doc.first_name || "",
  lastName: doc.last_name || "",
  email: doc.email || "",
  phone: doc.phone || "",
  position: doc.position || "",
  department: doc.department || "",
  // Normalize to date-only (YYYY-MM-DD) for consistent UI display
  joiningDate:
    typeof doc.joining_date === "string"
      ? doc.joining_date.split("T")[0]
      : "",
  dateOfBirth:
    typeof doc.date_of_birth === "string"
      ? doc.date_of_birth.split("T")[0]
      : undefined,
  status: doc.status || "active",
  employmentType: doc.employment_type || "full_time",
  baseSalary: typeof doc.base_salary === "number" ? doc.base_salary : doc.base_salary !== undefined ? parseFloat(doc.base_salary) || undefined : undefined,
  avatar: doc.profile_image,
  address: doc.address,
  createdAt: doc.created_at || doc.$createdAt || new Date().toISOString(),
  updatedAt: doc.updated_at || doc.$updatedAt || new Date().toISOString(),
});

/** Map camelCase EmployeeCreateInput to snake_case Appwrite document fields */
const mapInputToDoc = (data: EmployeeCreateInput, companyId: string) => {
  const now = new Date().toISOString();
  return {
    company_id: companyId,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    position: data.position,
    department: data.department,
    joining_date: data.joiningDate
      ? new Date(data.joiningDate).toISOString()
      : now,
    ...(data.dateOfBirth
      ? { date_of_birth: new Date(data.dateOfBirth).toISOString() }
      : {}),
    status: "active",
    employment_type: data.employmentType || "full_time",
    ...(data.baseSalary !== undefined ? { base_salary: data.baseSalary } : {}),
    created_at: now,
    updated_at: now,
  };
};

export const employeeService = {
  /**
   * Get all employees for a company
   */
  async getEmployees(
    companyId: string,
    limit = 50,
    offset = 0,
  ): Promise<Employee[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(limit), Query.offset(offset)],
      );
      return response.documents.map(mapDocToEmployee);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      throw error;
    }
  },

  /**
   * Get single employee by ID
   */
  async getEmployee(employeeId: string): Promise<Employee> {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
      );
      return mapDocToEmployee(response);
    } catch (error) {
      console.error("Failed to fetch employee:", error);
      throw error;
    }
  },

  /**
   * Create a new employee
   */
  async createEmployee(
    companyId: string,
    data: EmployeeCreateInput,
  ): Promise<Employee> {
    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        ID.unique(),
        mapInputToDoc(data, companyId),
      );
      return mapDocToEmployee(response);
    } catch (error) {
      console.error("Failed to create employee:", error);
      throw error;
    }
  },

  /**
   * Update employee
   */
  async updateEmployee(
    employeeId: string,
    data: EmployeeUpdateInput,
  ): Promise<Employee> {
    try {
      const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
      if (data.firstName !== undefined) updateData.first_name = data.firstName;
      if (data.lastName !== undefined) updateData.last_name = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.position !== undefined) updateData.position = data.position;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.joiningDate !== undefined)
        updateData.joining_date = new Date(data.joiningDate).toISOString();
      if (data.dateOfBirth !== undefined)
        updateData.date_of_birth = new Date(data.dateOfBirth).toISOString();
      if (data.employmentType !== undefined)
        updateData.employment_type = data.employmentType;
      if (data.baseSalary !== undefined) updateData.base_salary = data.baseSalary;

      const response = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
        updateData,
      );
      return mapDocToEmployee(response);
    } catch (error) {
      console.error("Failed to update employee:", error);
      throw error;
    }
  },

  /**
   * Delete employee
   */
  async deleteEmployee(employeeId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
      );
    } catch (error) {
      console.error("Failed to delete employee:", error);
      throw error;
    }
  },

  /**
   * Search employees by name or email
   */
  async searchEmployees(companyId: string, query: string): Promise<Employee[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(100)],
      );

      const employees = response.documents.map(mapDocToEmployee);
      const lowerQuery = query.toLowerCase();

      return employees.filter(
        (e) =>
          e.firstName.toLowerCase().includes(lowerQuery) ||
          e.lastName.toLowerCase().includes(lowerQuery) ||
          e.email.toLowerCase().includes(lowerQuery),
      );
    } catch (error) {
      console.error("Failed to search employees:", error);
      throw error;
    }
  },

  /**
   * Filter employees by department or status
   */
  async filterEmployees(
    companyId: string,
    filters: { department?: string; status?: string },
  ): Promise<Employee[]> {
    try {
      const queryFilters: string[] = [Query.equal("company_id", companyId)];
      if (filters.department) {
        queryFilters.push(Query.equal("department", filters.department));
      }
      if (filters.status) {
        queryFilters.push(Query.equal("status", filters.status));
      }

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        queryFilters,
      );

      return response.documents.map(mapDocToEmployee);
    } catch (error) {
      console.error("Failed to filter employees:", error);
      throw error;
    }
  },

  /**
   * Bulk import employees from CSV
   */
  async bulkImportEmployees(
    companyId: string,
    csvData: EmployeeCreateInput[],
  ): Promise<Employee[]> {
    try {
      const importedEmployees: Employee[] = [];

      for (const data of csvData) {
        const employee = await this.createEmployee(companyId, data);
        importedEmployees.push(employee);
      }

      return importedEmployees;
    } catch (error) {
      console.error("Failed to bulk import employees:", error);
      throw error;
    }
  },

  /**
   * Get employee count by status
   */
  async getEmployeeStats(companyId: string): Promise<{
    active: number;
    inactive: number;
    onLeave: number;
    total: number;
  }> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [Query.equal("company_id", companyId), Query.limit(500)],
      );

      const employees = response.documents.map(mapDocToEmployee);
      const stats = {
        active: employees.filter((e) => e.status === "active").length,
        inactive: employees.filter((e) => e.status === "inactive").length,
        onLeave: employees.filter((e) => e.status === "on_leave").length,
        total: employees.length,
      };

      return stats;
    } catch (error) {
      console.error("Failed to get employee stats:", error);
      throw error;
    }
  },
};
