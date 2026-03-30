import { EmployeeCreateInput } from "../types";

/**
 * Parse CSV content into employee records
 * Expected CSV format:
 * firstName,lastName,email,phone,position,department,joiningDate,dateOfBirth
 */
export const parseCSV = (csvContent: string): EmployeeCreateInput[] => {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV file must contain at least a header and one data row");
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const expectedHeaders = [
    "firstname",
    "lastname",
    "email",
    "phone",
    "position",
    "department",
    "joiningdate",
  ];

  const missingHeaders = expectedHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
  }

  const employees: EmployeeCreateInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(",").map((v) => v.trim());

    if (values.length < 7) {
      console.warn(`Skipping row ${i + 1}: insufficient columns`);
      continue;
    }

    const firstNameIdx = headers.indexOf("firstname");
    const lastNameIdx = headers.indexOf("lastname");
    const emailIdx = headers.indexOf("email");
    const phoneIdx = headers.indexOf("phone");
    const positionIdx = headers.indexOf("position");
    const departmentIdx = headers.indexOf("department");
    const joiningDateIdx = headers.indexOf("joiningdate");
    const dateOfBirthIdx = headers.indexOf("dateofbirth");

    const employee: EmployeeCreateInput = {
      firstName: values[firstNameIdx],
      lastName: values[lastNameIdx],
      email: values[emailIdx],
      phone: values[phoneIdx],
      position: values[positionIdx],
      department: values[departmentIdx],
      joiningDate: values[joiningDateIdx],
      dateOfBirth: dateOfBirthIdx >= 0 ? values[dateOfBirthIdx] : undefined,
    };

    // Validate required fields
    if (!employee.firstName || !employee.lastName || !employee.email) {
      console.warn(`Skipping row ${i + 1}: missing required fields`);
      continue;
    }

    employees.push(employee);
  }

  if (employees.length === 0) {
    throw new Error("No valid employee records found in CSV");
  }

  return employees;
};

/**
 * Generate a sample CSV template
 */
export const generateCSVTemplate = (): string => {
  return `firstName,lastName,email,phone,position,department,joiningDate,dateOfBirth
John,Doe,john.doe@example.com,+1-555-0100,Senior Developer,IT,2024-01-15,1990-05-20
Jane,Smith,jane.smith@example.com,+1-555-0101,Product Manager,IT,2024-02-20,1992-08-10
Michael,Johnson,michael.johnson@example.com,+1-555-0102,Sales Executive,Sales,2024-03-10,1988-03-15
Sarah,Williams,sarah.williams@example.com,+1-555-0103,HR Manager,HR,2024-01-01,1995-11-25`;
};

/**
 * Convert CSV text to base64 for storage/sharing
 */
export const csvToBase64 = (csvContent: string): string => {
  // Simple base64 conversion without using Buffer
  try {
    return btoa(unescape(encodeURIComponent(csvContent)));
  } catch (error) {
    // Fallback for environments where btoa is not available
    return csvContent;
  }
};

/**
 * Validate CSV format
 */
export const validateCSVFormat = (
  csvContent: string,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      errors.push("CSV file must contain at least a header and one data row");
      return { valid: false, errors };
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = [
      "firstname",
      "lastname",
      "email",
      "phone",
      "position",
      "department",
      "joiningdate",
    ];

    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      errors.push(`Missing required columns: ${missing.join(", ")}`);
    }

    // Check for valid data rows
    let validRows = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",");
      if (values.length >= requiredHeaders.length) {
        validRows++;
      }
    }

    if (validRows === 0) {
      errors.push("No valid data rows found in CSV");
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(
      `CSV parsing error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return { valid: false, errors };
  }
};
