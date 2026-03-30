#!/usr/bin/env node

/**
 * Automated Appwrite Setup Script
 * This script creates all required collections, buckets, and indexes for HRMate
 * Usage: APPWRITE_API_KEY=your_key APPWRITE_ENDPOINT=http://localhost/v1 APPWRITE_PROJECT_ID=project_id node scripts/setup-appwrite.js
 */

const { Client, Databases, Storage } = require("appwrite");
const fs = require("fs");
const path = require("path");

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const separatorIndex = line.indexOf("=");
    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warn: (msg) => console.warn(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

// Configuration
const config = {
  endpoint:
    process.env.APPWRITE_ENDPOINT ||
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
    "https://fra.cloud.appwrite.io/v1",
  projectId:
    process.env.APPWRITE_PROJECT_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
    "69ca44f20000ebf91141",
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId:
    process.env.APPWRITE_DATABASE_ID ||
    process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
    "69ca4ebb0005b6c43a63",
};

// Validate configuration
if (!config.projectId || !config.apiKey) {
  log.error(
    "Missing required environment variables. Please set: APPWRITE_PROJECT_ID and APPWRITE_API_KEY",
  );
  process.exit(1);
}

log.info(`Connecting to Appwrite at: ${config.endpoint}`);

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setKey(config.apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

// Collection definitions
const collections = [
  {
    id: "companies_collection",
    name: "Companies",
    fields: [
      { name: "name", type: "string", required: true },
      { name: "industry", type: "string", required: true },
      { name: "employees_count", type: "integer", required: false },
      { name: "subscription_tier", type: "string", required: true },
      { name: "billing_email", type: "email", required: false },
      { name: "subscription_starts", type: "datetime", required: false },
      { name: "subscription_ends", type: "datetime", required: false },
      { name: "logo_id", type: "string", required: false },
      { name: "settings", type: "json", required: false },
      { name: "created_by", type: "string", required: true },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "name_index", type: "key", attributes: ["name"] },
      {
        name: "subscription_index",
        type: "key",
        attributes: ["subscription_tier"],
      },
    ],
  },
  {
    id: "users_collection",
    name: "Users",
    fields: [
      { name: "email", type: "email", required: true },
      { name: "company_id", type: "string", required: true },
      { name: "role", type: "string", required: true },
      { name: "full_name", type: "string", required: true },
      { name: "phone", type: "phone", required: false },
      { name: "department", type: "string", required: false },
      { name: "profile_image", type: "string", required: false },
      { name: "is_active", type: "boolean", required: true },
      { name: "last_login", type: "datetime", required: false },
      { name: "preferences", type: "json", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "email_index", type: "unique", attributes: ["email"] },
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "role_index", type: "key", attributes: ["role"] },
    ],
  },
  {
    id: "employees_collection",
    name: "Employees",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "first_name", type: "string", required: true },
      { name: "last_name", type: "string", required: true },
      { name: "email", type: "email", required: true },
      { name: "phone", type: "phone", required: true },
      { name: "position", type: "string", required: true },
      { name: "department", type: "string", required: true },
      { name: "joining_date", type: "datetime", required: true },
      { name: "date_of_birth", type: "datetime", required: false },
      { name: "status", type: "string", required: true },
      { name: "employment_type", type: "string", required: true },
      { name: "manager_id", type: "string", required: false },
      { name: "salary_structure_id", type: "string", required: false },
      { name: "base_salary", type: "double", required: false },
      { name: "pan_number", type: "string", required: false },
      { name: "aadhar_number", type: "string", required: false },
      { name: "bank_account", type: "string", required: false },
      { name: "address", type: "string", required: false },
      { name: "profile_image", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "status_index", type: "key", attributes: ["status"] },
      { name: "email_index", type: "key", attributes: ["email"] },
    ],
  },
  {
    id: "attendance_collection",
    name: "Attendance",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "employee_id", type: "string", required: true },
      { name: "date", type: "datetime", required: true },
      { name: "status", type: "string", required: true },
      { name: "check_in_time", type: "datetime", required: false },
      { name: "check_out_time", type: "datetime", required: false },
      { name: "duration_hours", type: "double", required: false },
      { name: "location", type: "string", required: false },
      { name: "notes", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      {
        name: "employee_date_index",
        type: "key",
        attributes: ["employee_id", "date"],
      },
      { name: "company_index", type: "key", attributes: ["company_id"] },
    ],
  },
  {
    id: "leaves_collection",
    name: "Leaves",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "employee_id", type: "string", required: true },
      { name: "leave_type", type: "string", required: true },
      { name: "start_date", type: "datetime", required: true },
      { name: "end_date", type: "datetime", required: true },
      { name: "number_of_days", type: "integer", required: true },
      { name: "reason", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "approved_by", type: "string", required: false },
      { name: "approval_date", type: "datetime", required: false },
      { name: "comments", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "employee_index", type: "key", attributes: ["employee_id"] },
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "status_index", type: "key", attributes: ["status"] },
    ],
  },
  {
    id: "payroll_structure_collection",
    name: "Payroll Structure",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "employee_id", type: "string", required: true },
      { name: "basic_salary", type: "double", required: true },
      { name: "hra", type: "double", required: false },
      { name: "dearness_allowance", type: "double", required: false },
      { name: "conveyance", type: "double", required: false },
      { name: "other_allowances", type: "double", required: false },
      { name: "pf", type: "double", required: false },
      { name: "professional_tax", type: "double", required: false },
      { name: "income_tax", type: "double", required: false },
      { name: "other_deductions", type: "double", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "employee_index", type: "key", attributes: ["employee_id"] },
    ],
  },
  {
    id: "payslips_collection",
    name: "Payslips",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "employee_id", type: "string", required: true },
      { name: "month", type: "integer", required: true },
      { name: "year", type: "integer", required: true },
      { name: "gross_salary", type: "double", required: true },
      { name: "basic_salary", type: "double", required: true },
      { name: "allowances", type: "double", required: true },
      { name: "deductions", type: "double", required: true },
      { name: "net_salary", type: "double", required: true },
      { name: "breakdown", type: "json", required: false },
      { name: "pdf_url", type: "string", required: false },
      { name: "status", type: "string", required: true },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "employee_index", type: "key", attributes: ["employee_id"] },
      { name: "month_year_index", type: "key", attributes: ["month", "year"] },
    ],
  },
  {
    id: "payroll_collection",
    name: "Payroll",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "month", type: "integer", required: true },
      { name: "year", type: "integer", required: true },
      { name: "payslips", type: "string", required: false },
      { name: "total_amount", type: "double", required: true },
      { name: "status", type: "string", required: true },
      { name: "processed_at", type: "datetime", required: false },
      { name: "created_at", type: "datetime", required: true },
      { name: "updated_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "month_year_index", type: "key", attributes: ["month", "year"] },
    ],
  },
  {
    id: "documents_collection",
    name: "Documents",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "employee_id", type: "string", required: true },
      { name: "document_type", type: "string", required: true },
      { name: "file_id", type: "string", required: true },
      { name: "file_name", type: "string", required: true },
      { name: "file_url", type: "string", required: true },
      { name: "created_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "employee_index", type: "key", attributes: ["employee_id"] },
    ],
  },
  {
    id: "notifications_collection",
    name: "Notifications",
    fields: [
      { name: "user_id", type: "string", required: true },
      { name: "company_id", type: "string", required: true },
      { name: "title", type: "string", required: true },
      { name: "message", type: "string", required: true },
      { name: "type", type: "string", required: true },
      { name: "read", type: "boolean", required: true },
      { name: "created_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "user_index", type: "key", attributes: ["user_id"] },
      { name: "company_index", type: "key", attributes: ["company_id"] },
    ],
  },
  {
    id: "audit_logs_collection",
    name: "Audit Logs",
    fields: [
      { name: "company_id", type: "string", required: true },
      { name: "user_id", type: "string", required: true },
      { name: "action", type: "string", required: true },
      { name: "resource_type", type: "string", required: true },
      { name: "resource_id", type: "string", required: true },
      { name: "changes", type: "json", required: false },
      { name: "ip_address", type: "string", required: false },
      { name: "created_at", type: "datetime", required: true },
    ],
    indexes: [
      { name: "company_index", type: "key", attributes: ["company_id"] },
      { name: "user_index", type: "key", attributes: ["user_id"] },
    ],
  },
];

// Storage bucket definitions
const buckets = [
  { id: "employee_documents", name: "Employee Documents", maxSize: 52428800 }, // 50MB
  { id: "payslips", name: "Payslips", maxSize: 10485760 }, // 10MB
  { id: "company_logos", name: "Company Logos", maxSize: 5242880 }, // 5MB
];

async function createDatabase() {
  try {
    log.info("Checking database...");
    try {
      await databases.get(config.databaseId);
      log.success(`Database already exists: ${config.databaseId}`);
      return true;
    } catch (e) {
      if (e.code !== 404) throw e;
      log.info(`Creating database: ${config.databaseId}`);
      await databases.create(config.databaseId, config.databaseId);
      log.success(`Database created: ${config.databaseId}`);
      return true;
    }
  } catch (error) {
    log.error(`Failed to create/check database: ${error.message}`);
    throw error;
  }
}

async function createCollections() {
  let createdCollections = [];

  for (const collectionDef of collections) {
    try {
      log.info(`Checking collection: ${collectionDef.name}...`);

      // Try to get existing collection
      try {
        const existing = await databases.getCollection(
          config.databaseId,
          collectionDef.id,
        );
        log.success(`Collection already exists: ${collectionDef.id}`);
        createdCollections.push(collectionDef.id);
        continue;
      } catch (e) {
        if (e.code !== 404) throw e;
      }

      log.info(`Creating collection: ${collectionDef.name}...`);

      // Create collection
      const collection = await databases.createCollection(
        config.databaseId,
        collectionDef.id,
        collectionDef.name,
        [],
      );

      log.success(`Created collection: ${collectionDef.id}`);

      // Add fields
      for (const field of collectionDef.fields) {
        try {
          let fieldResponse;

          switch (field.type) {
            case "string":
              fieldResponse = await databases.createStringAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                255,
                field.required,
              );
              break;
            case "email":
              fieldResponse = await databases.createEmailAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "phone":
              fieldResponse = await databases.createPhoneAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "integer":
              fieldResponse = await databases.createIntegerAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "double":
              fieldResponse = await databases.createFloatAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "boolean":
              fieldResponse = await databases.createBooleanAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "datetime":
              fieldResponse = await databases.createDatetimeAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            case "json":
              fieldResponse = await databases.createJsonAttribute(
                config.databaseId,
                collectionDef.id,
                field.name,
                field.required,
              );
              break;
            default:
              throw new Error(`Unknown field type: ${field.type}`);
          }
        } catch (e) {
          // Field might already exist
          if (e.code === 409) {
            // log.warn(`Field already exists: ${field.name}`);
          } else {
            log.error(`Error creating field ${field.name}: ${e.message}`);
          }
        }
      }

      // Add indexes
      for (const index of collectionDef.indexes) {
        try {
          await databases.createIndex(
            config.databaseId,
            collectionDef.id,
            index.name,
            index.type,
            index.attributes,
          );
          log.success(`Created index: ${index.name}`);
        } catch (e) {
          if (e.code === 409) {
            // log.warn(`Index already exists: ${index.name}`);
          } else {
            log.error(`Error creating index ${index.name}: ${e.message}`);
          }
        }
      }

      createdCollections.push(collectionDef.id);
    } catch (error) {
      log.error(
        `Failed to create collection ${collectionDef.id}: ${error.message}`,
      );
    }
  }

  return createdCollections;
}

async function createBuckets() {
  let createdBuckets = [];

  for (const bucketDef of buckets) {
    try {
      log.info(`Checking bucket: ${bucketDef.name}...`);

      // Try to get existing bucket
      try {
        const existing = await storage.getBucket(bucketDef.id);
        log.success(`Bucket already exists: ${bucketDef.id}`);
        createdBuckets.push(bucketDef.id);
        continue;
      } catch (e) {
        if (e.code !== 404) throw e;
      }

      log.info(`Creating bucket: ${bucketDef.name}...`);

      const bucket = await storage.createBucket(
        bucketDef.id,
        bucketDef.name,
        [],
        false,
        false,
        bucketDef.maxSize,
        ["jpg", "jpeg", "png", "pdf", "doc", "docx", "xls", "xlsx", "csv"],
      );

      log.success(`Created bucket: ${bucketDef.id}`);
      createdBuckets.push(bucketDef.id);
    } catch (error) {
      log.error(`Failed to create bucket ${bucketDef.id}: ${error.message}`);
    }
  }

  return createdBuckets;
}

function updateEnvFile(collectionIds, bucketIds) {
  try {
    const envFile = path.join(__dirname, "..", ".env.local");

    log.info(`Preparing environment variables...`);

    let envContent = `# Appwrite Configuration (Auto-generated)
EXPO_PUBLIC_APPWRITE_ENDPOINT=${config.endpoint}
EXPO_PUBLIC_APPWRITE_PROJECT_ID=${config.projectId}
EXPO_PUBLIC_APPWRITE_DATABASE_ID=${config.databaseId}

# Collection IDs
EXPO_PUBLIC_USERS_COLLECTION=${collectionIds["users_collection"] || "users_collection"}
EXPO_PUBLIC_EMPLOYEES_COLLECTION=${collectionIds["employees_collection"] || "employees_collection"}
EXPO_PUBLIC_ATTENDANCE_COLLECTION=${collectionIds["attendance_collection"] || "attendance_collection"}
EXPO_PUBLIC_LEAVES_COLLECTION=${collectionIds["leaves_collection"] || "leaves_collection"}
EXPO_PUBLIC_PAYROLL_STRUCTURE_COLLECTION=${collectionIds["payroll_structure_collection"] || "payroll_structure_collection"}
EXPO_PUBLIC_PAYSLIPS_COLLECTION=${collectionIds["payslips_collection"] || "payslips_collection"}
EXPO_PUBLIC_DOCUMENTS_COLLECTION=${collectionIds["documents_collection"] || "documents_collection"}
EXPO_PUBLIC_NOTIFICATIONS_COLLECTION=${collectionIds["notifications_collection"] || "notifications_collection"}
EXPO_PUBLIC_AUDIT_LOGS_COLLECTION=${collectionIds["audit_logs_collection"] || "audit_logs_collection"}
EXPO_PUBLIC_COMPANIES_COLLECTION=${collectionIds["companies_collection"] || "companies_collection"}

# Bucket IDs
EXPO_PUBLIC_DOCUMENTS_BUCKET=${bucketIds["employee_documents"] || "employee_documents"}
EXPO_PUBLIC_PAYSLIPS_BUCKET=${bucketIds["payslips"] || "payslips"}
EXPO_PUBLIC_COMPANY_LOGOS_BUCKET=${bucketIds["company_logos"] || "company_logos"}

# Gemini API (if you have it)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
`;

    // Read existing env if it exists
    if (fs.existsSync(envFile)) {
      const existingContent = fs.readFileSync(envFile, "utf8");
      // Preserve non-Appwrite settings
      const preservedLines = existingContent
        .split("\n")
        .filter(
          (line) =>
            !line.startsWith("EXPO_PUBLIC_APPWRITE") &&
            !line.startsWith("EXPO_PUBLIC_USERS_") &&
            !line.startsWith("EXPO_PUBLIC_EMPLOYEES_") &&
            !line.startsWith("EXPO_PUBLIC_ATTENDANCE_") &&
            !line.startsWith("EXPO_PUBLIC_LEAVES_") &&
            !line.startsWith("EXPO_PUBLIC_PAYROLL") &&
            !line.startsWith("EXPO_PUBLIC_PAYSLIPS") &&
            !line.startsWith("EXPO_PUBLIC_DOCUMENTS") &&
            !line.startsWith("EXPO_PUBLIC_NOTIFICATIONS") &&
            !line.startsWith("EXPO_PUBLIC_AUDIT_LOGS") &&
            !line.startsWith("EXPO_PUBLIC_COMPANIES") &&
            !line.startsWith("EXPO_PUBLIC_APP_ENV") &&
            line.trim(),
        );
      if (preservedLines.length > 0) {
        envContent += "\n# Previous settings\n" + preservedLines.join("\n");
      }
    }

    fs.writeFileSync(envFile, envContent);
    log.success(`Environment file updated: ${envFile}`);

    // Also update .env if it exists
    const envPath = path.join(__dirname, "..", ".env");
    if (!fs.existsSync(envFile)) {
      fs.writeFileSync(envFile, envContent);
    }
  } catch (error) {
    log.error(`Failed to update environment file: ${error.message}`);
  }
}

async function main() {
  try {
    console.log("\n" + colors.cyan + "🚀 HRMate Appwrite Setup" + colors.reset);
    console.log("=".repeat(60) + "\n");

    // Step 1: Create database
    await createDatabase();

    // Step 2: Create collections
    log.info("\nCreating collections...");
    const createdCollections = await createCollections();
    log.success(`\n✓ Created ${createdCollections.length} collections`);

    // Step 3: Create buckets
    log.info("\nCreating storage buckets...");
    const createdBuckets = await createBuckets();
    log.success(`✓ Created ${createdBuckets.length} buckets`);

    // Step 4: Update environment file
    const collectionMap = {};
    const bucketMap = {};
    collections.forEach((c) => (collectionMap[c.id] = c.id));
    buckets.forEach((b) => (bucketMap[b.id] = b.id));
    updateEnvFile(collectionMap, bucketMap);

    console.log(
      "\n" + colors.green + "✅ Appwrite setup completed!" + colors.reset,
    );
    console.log("=".repeat(60) + "\n");
    console.log(`${colors.cyan}Summary:${colors.reset}`);
    console.log(`  • Database: ${config.databaseId}`);
    console.log(`  • Collections: ${createdCollections.length}`);
    console.log(`  • Buckets: ${createdBuckets.length}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Check the .env.local file for collection IDs`);
    console.log(
      `  2. Set EXPO_PUBLIC_GEMINI_API_KEY if you have Gemini AI API key`,
    );
    console.log(`  3. Start your app: npm start\n`);
  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

main();
