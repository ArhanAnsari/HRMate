import { APPWRITE_CONFIG, DB_IDS } from "../config/env";
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "../types";
import { databases } from "./appwrite";

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
        [`companyId="${companyId}"`],
      );
      return response.documents as unknown as Employee[];
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
      return response as unknown as Employee;
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
        "unique()",
        {
          ...data,
          companyId,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      );
      return response as unknown as Employee;
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
      const response = await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        employeeId,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      );
      return response as unknown as Employee;
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
        [`companyId="${companyId}"`],
      );

      const employees = response.documents as unknown as Employee[];
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
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        DB_IDS.EMPLOYEES,
        [`companyId="${companyId}"`],
      );

      let employees = response.documents as unknown as Employee[];

      if (filters.department) {
        employees = employees.filter(
          (e) => e.department === filters.department,
        );
      }

      if (filters.status) {
        employees = employees.filter((e) => e.status === filters.status);
      }

      return employees;
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
        [`companyId="${companyId}"`],
      );

      const employees = response.documents as unknown as Employee[];
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
