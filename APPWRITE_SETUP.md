# HRMate - Appwrite Complete Setup Guide

## Prerequisites

- Appwrite instance running (local or cloud)
- Appwrite API key with admin access
- Project created in Appwrite Console

---

## Step 1: Create Database

**In Appwrite Console:**

1. Go to **Databases**
2. Click **Create Database**
3. Name: `default` (or any name you prefer)
4. Copy the **Database ID** and paste into `src/config/env.ts`

---

## Step 2: Create Collections

### Collection 1: Companies

**Collection ID:** `companies_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| name | String | Yes | Company name |
| industry | String | Yes | Industry type |
| employees_count | Number | No | Total employees |
| subscription_tier | String | Yes | free, pro, enterprise |
| billing_email | Email | No | |
| subscription_starts | DateTime | No | |
| subscription_ends | DateTime | No | |
| logo_id | String | No | File ID from storage |
| settings | JSON | No | Company-specific settings |
| created_at | DateTime | Auto | Auto-set |
| created_by | String | Yes | User ID who created |

**Indexes:**

- `name` (String, Ascending)
- `subscription_tier` (String, Ascending)

---

### Collection 2: Users

**Collection ID:** `users_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| email | Email | Yes | Unique identifier |
| company_id | String | Yes | Company ID (link to companies) |
| role | String | Yes | admin, manager, employee |
| full_name | String | Yes | |
| phone | Phone | No | |
| department | String | No | |
| profile_image | String | No | File ID |
| is_active | Boolean | Yes | Default: true |
| last_login | DateTime | No | |
| preferences | JSON | No | Dark mode, language, etc. |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- `email` (String, Ascending) - **UNIQUE**
- `company_id` (String, Ascending)
- `role` (String, Ascending)

---

### Collection 3: Employees

**Collection ID:** `employees_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | Link to Company |
| first_name | String | Yes | |
| last_name | String | Yes | |
| email | Email | Yes | Unique per company |
| phone | Phone | Yes | |
| position | String | Yes | Job title |
| department | String | Yes | Department name |
| joining_date | DateTime | Yes | |
| status | String | Yes | active, inactive, on_leave |
| employment_type | String | Yes | full_time, part_time, contract |
| manager_id | String | No | Employee ID of manager |
| salary_structure_id | String | No | Link to PayrollStructure |
| base_salary | Number | No | Monthly base |
| pan_number | String | No | Tax ID |
| aadhar_number | String | No | ID number (masked) |
| bank_account | String | No | Masked for security |
| address | String | No | |
| city | String | No | |
| state | String | No | |
| country | String | No | |
| emergency_contact | String | No | |
| emergency_phone | String | No | |
| is_active | Boolean | Yes | Default: true |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- Composite: `company_id` + `email` (UNIQUE)
- `company_id` (String, Ascending)
- `department` (String, Ascending)
- `status` (String, Ascending)
- `joining_date` (DateTime, Descending)

---

### Collection 4: Attendance

**Collection ID:** `attendance_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| employee_id | String | Yes | Link to Employees |
| date | DateTime | Yes | Attendance date |
| check_in_time | DateTime | No | When checked in |
| check_out_time | DateTime | No | When checked out |
| status | String | Yes | present, absent, half_day, on_leave |
| duration_hours | Number | No | Total hours worked |
| notes | String | No | Reason if absent |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- Composite: `employee_id` + `date` (UNIQUE)
- `company_id` (String, Ascending)
- `employee_id` (String, Ascending)
- `date` (DateTime, Descending)
- `status` (String, Ascending)

---

### Collection 5: Leaves

**Collection ID:** `leaves_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| employee_id | String | Yes | |
| leave_type | String | Yes | sick, casual, paid, unpaid, maternity |
| from_date | DateTime | Yes | Start date |
| to_date | DateTime | Yes | End date |
| days_count | Number | Yes | Number of days |
| reason | String | Yes | Reason for leave |
| status | String | Yes | pending, approved, rejected |
| approved_by | String | No | Manager/HR ID |
| approval_date | DateTime | No | When approved |
| approval_notes | String | No | Rejection reason if rejected |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- `company_id` (String, Ascending)
- `employee_id` (String, Ascending)
- `status` (String, Ascending)
- `from_date` (DateTime, Descending)

---

### Collection 6: PayrollStructure

**Collection ID:** `payroll_structure_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| name | String | Yes | Structure name (e.g., "Developer") |
| basic_salary | Number | Yes | Base amount |
| hra_percent | Number | No | HRA percentage |
| hra_amount | Number | No | Fixed HRA |
| dearness_allowance | Number | No | DA amount |
| other_allowances | JSON | No | {name: amount} |
| pf_percent | Number | No | PF deduction % |
| tax_percent | Number | No | Tax % |
| other_deductions | JSON | No | {name: amount} |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- `company_id` (String, Ascending)
- `name` (String, Ascending)

---

### Collection 7: Payslips

**Collection ID:** `payslips_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| employee_id | String | Yes | |
| month | DateTime | Yes | Month/year |
| basic_salary | Number | Yes | |
| earnings | JSON | Yes | {hra: 5000, da: 2000, ...} |
| deductions | JSON | Yes | {pf: 1800, tax: 5000, ...} |
| gross_salary | Number | Yes | Total earnings |
| net_salary | Number | Yes | Gross - deductions |
| pdf_file_id | String | No | Generated PDF file ID |
| status | String | Yes | draft, generated, sent, received |
| sent_date | DateTime | No | When sent to employee |
| created_at | DateTime | Auto | |
| updated_at | DateTime | Auto | |

**Indexes:**

- Composite: `employee_id` + `month` (UNIQUE)
- `company_id` (String, Ascending)
- `employee_id` (String, Ascending)
- `month` (DateTime, Descending)

---

### Collection 8: Documents

**Collection ID:** `documents_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| employee_id | String | Yes | Link to employee |
| document_type | String | Yes | aadhar, pan, contract, id, certificate |
| file_id | String | Yes | Storage file ID |
| file_name | String | Yes | Original filename |
| file_url | String | Yes | Accessible URL |
| uploaded_by | String | Yes | User ID who uploaded |
| created_at | DateTime | Auto | |
| expires_at | DateTime | No | Expiration date if applicable |

**Indexes:**

- `company_id` (String, Ascending)
- `employee_id` (String, Ascending)
- `document_type` (String, Ascending)

---

### Collection 9: Notifications

**Collection ID:** `notifications_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| user_id | String | Yes | Recipient |
| title | String | Yes | |
| message | String | Yes | |
| type | String | Yes | leave_request, payroll, alert, message |
| reference_id | String | No | ID of referenced entity |
| is_read | Boolean | Yes | Default: false |
| action_url | String | No | Deep link |
| created_at | DateTime | Auto | |

**Indexes:**

- `user_id` (String, Ascending)
- `is_read` (Boolean, Ascending)
- `created_at` (DateTime, Descending)

---

### Collection 10: AuditLogs

**Collection ID:** `audit_logs_collection`

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| company_id | String | Yes | |
| user_id | String | Yes | Who performed action |
| action | String | Yes | create, update, delete, approve |
| entity_type | String | Yes | Employee, Leave, Payroll |
| entity_id | String | Yes | ID of affected entity |
| changes | JSON | No | {field: {old, new}} |
| ip_address | String | No | |
| created_at | DateTime | Auto | |

**Indexes:**

- `company_id` (String, Ascending)
- `entity_type` (String, Ascending)
- `created_at` (DateTime, Descending)

---

## Step 3: Create Storage Buckets

### Bucket 1: Company Logos

**Bucket ID:** `company_logos`

- Max file size: 5 MB
- Allowed MIME types: image/\*, application/pdf

### Bucket 2: Employee Documents

**Bucket ID:** `employee_documents`

- Max file size: 10 MB
- Allowed MIME types: image/\*, application/pdf

### Bucket 3: Payslips

**Bucket ID:** `payslips`

- Max file size: 5 MB
- Allowed MIME types: application/pdf

---

## Step 4: Update Environment Variables

Create or update `.env` file in project root:

```env
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=default

# Collection IDs
EXPO_PUBLIC_COMPANIES_COLLECTION=companies_collection
EXPO_PUBLIC_USERS_COLLECTION=users_collection
EXPO_PUBLIC_EMPLOYEES_COLLECTION=employees_collection
EXPO_PUBLIC_ATTENDANCE_COLLECTION=attendance_collection
EXPO_PUBLIC_LEAVES_COLLECTION=leaves_collection
EXPO_PUBLIC_PAYROLL_STRUCTURE_COLLECTION=payroll_structure_collection
EXPO_PUBLIC_PAYSLIPS_COLLECTION=payslips_collection
EXPO_PUBLIC_DOCUMENTS_COLLECTION=documents_collection
EXPO_PUBLIC_NOTIFICATIONS_COLLECTION=notifications_collection
EXPO_PUBLIC_AUDIT_LOGS_COLLECTION=audit_logs_collection

# Storage Buckets
EXPO_PUBLIC_COMPANY_LOGOS_BUCKET=company_logos
EXPO_PUBLIC_DOCUMENTS_BUCKET=employee_documents
EXPO_PUBLIC_PAYSLIPS_BUCKET=payslips

# Gemini API (for AI features)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

---

## Step 5: Update `src/config/env.ts`

```typescript
export const APPWRITE_CONFIG = {
  ENDPOINT: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  PROJECT_ID: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  DATABASE_ID: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "default",
};

export const DB_IDS = {
  COMPANIES:
    process.env.EXPO_PUBLIC_COMPANIES_COLLECTION || "companies_collection",
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
  AUDIT_LOGS:
    process.env.EXPO_PUBLIC_AUDIT_LOGS_COLLECTION || "audit_logs_collection",
};

export const STORAGE_IDS = {
  COMPANY_LOGOS:
    process.env.EXPO_PUBLIC_COMPANY_LOGOS_BUCKET || "company_logos",
  DOCUMENTS: process.env.EXPO_PUBLIC_DOCUMENTS_BUCKET || "employee_documents",
  PAYSLIPS: process.env.EXPO_PUBLIC_PAYSLIPS_BUCKET || "payslips",
};

export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;
```

---

## Quick Setup Script (Optional)

If you want to automate collection creation, use this cURL commands or create an Appwrite function:

```bash
# Export these first
export APPWRITE_ENDPOINT="http://localhost/v1"
export APPWRITE_ID="<apikey>"
export DATABASE_ID="default"
export PROJECT_ID="<project_id>"

# Create companies collection
curl -X POST "$APPWRITE_ENDPOINT/databases/$DATABASE_ID/collections" \
  -H "X-Appwrite-Project: $PROJECT_ID" \
  -H "X-Appwrite-Key: $APPWRITE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "collectionId": "companies_collection",
    "name": "Companies",
    "permissions": []
  }'

# ... repeat for each collection
```

---

## Testing the Setup

1. **Test Connection:**

```typescript
import { client, databases } from "./src/services/appwrite";

// Try to list databases
const dbs = await client.call(async () => {
  return await databases.list();
});
console.log("Connected!", dbs);
```

2. **Test Collection:**

```typescript
const collections = await databases.listCollections("default");
console.log(
  "Collections:",
  collections.collections.map((c) => c.name),
);
```

---

## What's Next

Once collections are created:

1. **Update DB_IDS in `src/config/env.ts`**
2. **Uncomment service calls** in components
3. **Test login** - should save to users_collection
4. **Test employee CRUD** - fully functional
5. **Build other features** using same pattern

---

## Security Notes

⚠️ **Permissions:**

- Configure Appwrite permissions for:
  - Users can only see their own data
  - Managers can see employee data
  - Admins see everything
  - Documents are private

⚠️ **Validation:**

- Add Appwrite Permissions & Roles before production
- Validate data in both frontend and backend
- Mask sensitive fields (bank account, ID numbers)

---

## Troubleshooting

**Collection creation fails:**

- Check API key has admin access
- Ensure database exists
- Verify collection ID format (no spaces, lowercase)

**Connection errors:**

- Verify ENDPOINT includes `/v1`
- Check PROJECT_ID is correct
- Ensure Appwrite container is running

**Data not saving:**

- Check Appwrite logs
- Verify permissions are set correctly
- Test with Appwrite console directly

---

## Final Checklist

- [ ] Appwrite instance running
- [ ] Database created (`default`)
- [ ] 10 Collections created with correct schemas
- [ ] 3 Storage buckets created
- [ ] `.env` file updated with IDs
- [ ] `src/config/env.ts` updated
- [ ] Services updated with correct collection IDs
- [ ] Ready to test!

You're now ready to connect HRMate to your backend! 🚀
