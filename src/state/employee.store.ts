import { create } from "zustand";
import { employeeService } from "../services/employees.service";
import { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "../types";

interface EmployeeStore {
  employees: Employee[];
  selectedEmployee: Employee | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  fetchEmployees: (companyId: string) => Promise<void>;
  fetchEmployee: (employeeId: string) => Promise<void>;
  createEmployee: (
    companyId: string,
    data: EmployeeCreateInput,
  ) => Promise<Employee>;
  updateEmployee: (
    employeeId: string,
    data: EmployeeUpdateInput,
  ) => Promise<Employee>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  searchEmployees: (companyId: string, query: string) => Promise<void>;
  filterEmployees: (
    companyId: string,
    filters: { department?: string; status?: string },
  ) => Promise<void>;
  bulkImportEmployees: (
    companyId: string,
    employees: EmployeeCreateInput[],
  ) => Promise<void>;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
  clearSelected: () => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  isLoading: false,
  error: null,
  searchQuery: "",

  fetchEmployees: async (companyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const employees = await employeeService.getEmployees(companyId);
      set({ employees, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch employees";
      set({ error: errorMsg, isLoading: false });
    }
  },

  fetchEmployee: async (employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      const employee = await employeeService.getEmployee(employeeId);
      set({ selectedEmployee: employee, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch employee";
      set({ error: errorMsg, isLoading: false });
    }
  },

  createEmployee: async (companyId: string, data: EmployeeCreateInput) => {
    set({ isLoading: true, error: null });
    try {
      const employee = await employeeService.createEmployee(companyId, data);
      const { employees } = get();
      set({ employees: [employee, ...employees], isLoading: false });
      return employee;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to create employee";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  updateEmployee: async (employeeId: string, data: EmployeeUpdateInput) => {
    set({ isLoading: true, error: null });
    try {
      const employee = await employeeService.updateEmployee(employeeId, data);
      const { employees, selectedEmployee } = get();
      set({
        employees: employees.map((e) => (e.$id === employeeId ? employee : e)),
        selectedEmployee:
          selectedEmployee?.$id === employeeId ? employee : selectedEmployee,
        isLoading: false,
      });
      return employee;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to update employee";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  deleteEmployee: async (employeeId: string) => {
    set({ isLoading: true, error: null });
    try {
      await employeeService.deleteEmployee(employeeId);
      const { employees } = get();
      set({
        employees: employees.filter((e) => e.$id !== employeeId),
        isLoading: false,
      });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to delete employee";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  searchEmployees: async (companyId: string, query: string) => {
    set({ isLoading: true, error: null, searchQuery: query });
    try {
      const employees = await employeeService.searchEmployees(companyId, query);
      set({ employees, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to search employees";
      set({ error: errorMsg, isLoading: false });
    }
  },

  filterEmployees: async (
    companyId: string,
    filters: { department?: string; status?: string },
  ) => {
    set({ isLoading: true, error: null });
    try {
      const employees = await employeeService.filterEmployees(
        companyId,
        filters,
      );
      set({ employees, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to filter employees";
      set({ error: errorMsg, isLoading: false });
    }
  },

  bulkImportEmployees: async (
    companyId: string,
    employees: EmployeeCreateInput[],
  ) => {
    set({ isLoading: true, error: null });
    try {
      await employeeService.bulkImportEmployees(companyId, employees);
      // Fetch fresh list after import
      const fetchedEmployees = await employeeService.getEmployees(companyId);
      set({ employees: fetchedEmployees, isLoading: false });
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to import employees";
      set({ error: errorMsg, isLoading: false });
      throw err;
    }
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  clearError: () => set({ error: null }),
  clearSelected: () => set({ selectedEmployee: null }),
}));
