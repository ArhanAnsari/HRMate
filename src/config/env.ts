/**
 * Environment Configuration
 * Uses process.env (exposed as EXPO_PUBLIC_* from .env files)
 */

export const APP_META = {
  NAME: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME || "HRMate",
};

// Appwrite Configuration
export const APPWRITE_CONFIG = {
  ENDPOINT:
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    "https://fra.cloud.appwrite.io/v1",
  PROJECT_ID:
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "69ca44f20000ebf91141",
  DATABASE_ID:
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "69ca4ebb0005b6c43a63",
  API_KEY: process.env.APPWRITE_API_KEY || "",
};

// Database Collection IDs
export const DB_IDS = {
  USERS: process.env.EXPO_PUBLIC_USERS_COLLECTION || "users_collection",
  EMPLOYEES:
    process.env.EXPO_PUBLIC_EMPLOYEES_COLLECTION || "employees_collection",
  ATTENDANCE:
    process.env.EXPO_PUBLIC_ATTENDANCE_COLLECTION || "attendance_collection",
  LEAVES: process.env.EXPO_PUBLIC_LEAVES_COLLECTION || "leaves_collection",
  PAYROLL_STRUCTURE:
    process.env.EXPO_PUBLIC_PAYROLL_STRUCTURE_COLLECTION ||
    "payroll_structure_collection",
  PAYSLIPS:
    process.env.EXPO_PUBLIC_PAYSLIPS_COLLECTION || "payslips_collection",
  DOCUMENTS:
    process.env.EXPO_PUBLIC_DOCUMENTS_COLLECTION || "documents_collection",
  NOTIFICATIONS:
    process.env.EXPO_PUBLIC_NOTIFICATIONS_COLLECTION ||
    "notifications_collection",
  DEVICE_TOKENS:
    process.env.EXPO_PUBLIC_DEVICE_TOKENS_COLLECTION ||
    "device_tokens_collection",
  NOTIFICATION_PREFERENCES:
    process.env.EXPO_PUBLIC_NOTIFICATION_PREFERENCES_COLLECTION ||
    "notification_preferences_collection",
  NOTIFICATION_LOGS:
    process.env.EXPO_PUBLIC_NOTIFICATION_LOGS_COLLECTION ||
    "notification_logs_collection",
  AUDIT_LOGS:
    process.env.EXPO_PUBLIC_AUDIT_LOGS_COLLECTION || "audit_logs_collection",
  COMPANIES:
    process.env.EXPO_PUBLIC_COMPANIES_COLLECTION || "companies_collection",
};

// Storage Bucket IDs
export const STORAGE_BUCKETS = {
  DOCUMENTS: process.env.EXPO_PUBLIC_DOCUMENTS_BUCKET || "employee_documents",
  PAYSLIPS: process.env.EXPO_PUBLIC_PAYSLIPS_BUCKET || "payslips",
  COMPANY_LOGOS:
    process.env.EXPO_PUBLIC_COMPANY_LOGOS_BUCKET || "company_logos",
};

// Gemini API Configuration
export const GEMINI_CONFIG = {
  API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || "",
  MODEL: "gemini-2.5-flash",
};

export const IS_PRODUCTION = !__DEV__;

// Validation
if (!APPWRITE_CONFIG.PROJECT_ID || APPWRITE_CONFIG.PROJECT_ID === "default") {
  console.warn(
    "⚠️ Appwrite Project ID not configured. Set EXPO_PUBLIC_APPWRITE_PROJECT_ID in .env",
  );
}

if (!GEMINI_CONFIG.API_KEY) {
  console.warn(
    "⚠️ Gemini API Key not configured. Set EXPO_PUBLIC_GEMINI_API_KEY in .env to enable AI features",
  );
}

if (!APPWRITE_CONFIG.DATABASE_ID) {
  console.warn(
    "⚠️ Appwrite Database ID not configured. Set EXPO_PUBLIC_APPWRITE_DATABASE_ID in .env",
  );
}
