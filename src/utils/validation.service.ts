/**
 * ✅ INPUT VALIDATION UTILITIES
 * Comprehensive validation for forms and data
 */

export class ValidationService {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex =
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidSalary(salary: number): boolean {
    return salary > 0 && salary < 1000000;
  }

  static isValidDate(date: string): boolean {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }

  static isDateInPast(date: string): boolean {
    return new Date(date) < new Date();
  }

  static isDateInFuture(date: string): boolean {
    return new Date(date) > new Date();
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<[^>]*>/g, "")
      .slice(0, 500);
  }

  static validateEmployeeForm(formData: {
    name?: string;
    email?: string;
    phone?: string;
    department?: string;
    role?: string;
    salary?: number;
    joinDate?: string;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = "Name is required";
    } else if (formData.name.length > 100) {
      errors.name = "Name must be less than 100 characters";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!this.isValidEmail(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (formData.phone && !this.isValidPhoneNumber(formData.phone)) {
      errors.phone = "Invalid phone number format";
    }

    if (!formData.department) {
      errors.department = "Department is required";
    }

    if (!formData.role) {
      errors.role = "Role is required";
    }

    if (formData.salary && !this.isValidSalary(formData.salary)) {
      errors.salary = "Salary must be between 0 and 1,000,000";
    }

    if (formData.joinDate && !this.isValidDate(formData.joinDate)) {
      errors.joinDate = "Invalid date format";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateLeaveForm(formData: {
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    reason?: string;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!formData.leaveType) {
      errors.leaveType = "Leave type is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else if (!this.isValidDate(formData.startDate)) {
      errors.startDate = "Invalid start date";
    } else if (this.isDateInPast(formData.startDate)) {
      errors.startDate = "Start date cannot be in the past";
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (!this.isValidDate(formData.endDate)) {
      errors.endDate = "Invalid end date";
    } else if (
      formData.startDate &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      errors.endDate = "End date must be after start date";
    }

    if (!formData.reason || formData.reason.trim().length === 0) {
      errors.reason = "Reason is required";
    } else if (formData.reason.length > 500) {
      errors.reason = "Reason must be less than 500 characters";
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static getPasswordStrength(password: string): "weak" | "medium" | "strong" {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 3) return "medium";
    return "strong";
  }
}

export default ValidationService;
