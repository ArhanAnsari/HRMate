/**
 * 🔍 SEARCH & FILTER UTILITIES
 * Helper functions for searching and filtering employees
 */

export interface SearchFilters {
  query?: string;
  department?: string;
  role?: string;
  status?: "active" | "inactive" | "on_leave";
}

export class SearchService {
  static debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout | number;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static searchEmployees(employees: any[], filters: SearchFilters): any[] {
    return employees.filter((emp) => {
      // Search by name, email, or ID
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const matchesQuery =
          emp.name?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          emp.employeeId?.toString().includes(query);

        if (!matchesQuery) return false;
      }

      // Filter by department
      if (filters.department && emp.department !== filters.department) {
        return false;
      }

      // Filter by role
      if (filters.role && emp.role !== filters.role) {
        return false;
      }

      // Filter by status
      if (filters.status) {
        if (filters.status === "active" && emp.status !== "ACTIVE")
          return false;
        if (filters.status === "inactive" && emp.status !== "INACTIVE")
          return false;
        if (filters.status === "on_leave" && !emp.isOnLeave) return false;
      }

      return true;
    });
  }

  static getUniqueValues(
    employees: any[],
    field: "department" | "role" | "status",
  ): string[] {
    const values = new Set<string>();
    employees.forEach((emp) => {
      if (emp[field]) {
        values.add(emp[field]);
      }
    });
    return Array.from(values).sort();
  }

  static sortEmployees(
    employees: any[],
    sortBy: "name" | "email" | "department" | "salary",
    ascending: boolean = true,
  ): any[] {
    return [...employees].sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";

      if (typeof aVal === "string") {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return ascending ? aVal - bVal : bVal - aVal;
    });
  }
}

export default SearchService;
