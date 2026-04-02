# HRMate — Appwrite Console Setup Guide

Step-by-step instructions for creating the HRMate backend in the Appwrite Console.
Follow this guide **in order**. All field names use `snake_case` to match the codebase.

---

## Prerequisites

- An [Appwrite Cloud](https://cloud.appwrite.io) account (or self-hosted Appwrite ≥ 1.5)
- A project already created — note its **Project ID**
- Node.js installed locally (for the optional CLI deploy path)

---

## Step 1 — Create the Database

1. Open your Appwrite Console → **Databases** → **Create database**
2. Set **Database ID** to: `69ca4ebb0005b6c43a63`  
   *(or any custom ID — then update `EXPO_PUBLIC_APPWRITE_DATABASE_ID` in `.env`)*
3. Set **Name** to: `HRMate`
4. Click **Create**

---

## Step 2 — Create Collections

Create each collection below inside the database. For every collection:

- **Permissions** → add the role `users` with **Create / Read / Update / Delete**
- Leave **Document security** OFF (unless you need per-document ACLs)

---

### 2.1 `companies_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `name` | String (255) | ✅ | — | Company name |
| `industry` | String (255) | ✅ | — | e.g. Technology |
| `subscription_tier` | String (255) | ✅ | — | e.g. free / pro |
| `billing_email` | String (255) | ❌ | — | |
| `created_by` | String (255) | ✅ | — | Auth user ID |
| `employees_count` | Integer | ❌ | 0 | |
| `subscription_starts` | Datetime | ❌ | — | |
| `subscription_ends` | Datetime | ❌ | — | |
| `created_at` | Datetime | ✅ | — | |
| `updated_at` | Datetime | ✅ | — | |

**Indexes:** none required.

---

### 2.2 `users_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `email` | String (255) | ✅ | — | Must be unique |
| `company_id` | String (255) | ✅ | — | FK → companies |
| `role` | String (255) | ✅ | — | admin / hr / employee |
| `full_name` | String (255) | ✅ | — | |
| `phone` | String (32) | ❌ | — | |
| `department` | String (255) | ❌ | — | |
| `profile_image` | String (255) | ❌ | — | Storage file ID |
| `is_active` | Boolean | ✅ | — | |
| `last_login` | Datetime | ❌ | — | |
| `preferences` | String (10000) | ❌ | — | JSON string |
| `created_at` | Datetime | ✅ | — | |
| `updated_at` | Datetime | ✅ | — | |

**Indexes:**
- `email_index` → key on `email` ASC
- `company_index` → key on `company_id` ASC

---

### 2.3 `employees_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `first_name` | String (255) | ✅ | — | |
| `last_name` | String (255) | ✅ | — | |
| `company_id` | String (255) | ✅ | — | FK → companies |
| `employment_type` | String (255) | ✅ | — | full-time / part-time / contractor |
| `joining_date` | Datetime | ❌ | — | |
| `date_of_birth` | Datetime | ❌ | — | |
| `base_salary` | Double | ❌ | — | |
| `profile_image` | String (255) | ❌ | — | Storage file ID |
| `department` | String (255) | ❌ | — | |
| `position` | String (255) | ❌ | — | |
| `phone` | String (32) | ❌ | — | |
| `email` | String (255) | ❌ | — | |
| `is_active` | Boolean | ❌ | true | |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC

---

### 2.4 `attendance_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `employee_id` | String (255) | ✅ | — | FK → employees |
| `employee_name` | String (255) | ❌ | — | Denormalised for display |
| `employee_email` | String (255) | ❌ | — | |
| `date` | String (32) | ✅ | — | YYYY-MM-DD |
| `status` | String (32) | ✅ | — | present / absent / late / on_leave |
| `check_in_time` | String (10) | ❌ | — | HH:MM (24 h) |
| `check_out_time` | String (10) | ❌ | — | HH:MM (24 h) |
| `duration_hours` | Double | ❌ | — | Hours worked |
| `location` | String (255) | ❌ | — | GPS or office name |
| `notes` | String (1024) | ❌ | — | |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC
- `employee_index` → key on `employee_id` ASC
- `date_index` → key on `date` ASC

---

### 2.5 `leaves_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `employee_id` | String (255) | ✅ | — | FK → employees |
| `leave_type` | String (255) | ✅ | — | sick / casual / paid / unpaid |
| `start_date` | Datetime | ✅ | — | |
| `end_date` | Datetime | ✅ | — | |
| `number_of_days` | Integer | ✅ | — | |
| `reason` | String (1024) | ✅ | — | |
| `status` | String (32) | ✅ | — | pending / approved / rejected / cancelled |
| `approved_by` | String (255) | ❌ | — | User ID of approver |
| `approval_date` | Datetime | ❌ | — | |
| `comments` | String (1024) | ❌ | — | Approval/rejection notes |
| `created_at` | Datetime | ✅ | — | |
| `updated_at` | Datetime | ✅ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC
- `employee_index` → key on `employee_id` ASC
- `status_index` → key on `status` ASC

---

### 2.6 `payroll_structure_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `name` | String (255) | ✅ | — | Structure name |
| `basic_salary_percent` | Double | ❌ | — | |
| `hra_percent` | Double | ❌ | — | House Rent Allowance |
| `pf_percent` | Double | ❌ | — | Provident Fund |
| `tax_rate` | Double | ❌ | — | |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC

---

### 2.7 `payslips_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `employee_id` | String (255) | ✅ | — | |
| `month` | String (32) | ✅ | — | YYYY-MM |
| `gross_salary` | Double | ❌ | — | |
| `net_salary` | Double | ❌ | — | |
| `deductions` | Double | ❌ | — | |
| `status` | String (32) | ❌ | — | draft / processed / sent |
| `pdf_url` | String (1024) | ❌ | — | Storage file URL |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC
- `employee_index` → key on `employee_id` ASC

---

### 2.8 `documents_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `employee_id` | String (255) | ❌ | — | Null = company-wide |
| `name` | String (255) | ✅ | — | Document title |
| `type` | String (255) | ❌ | — | contract / payslip / id / other |
| `file_id` | String (255) | ❌ | — | Storage file ID |
| `uploaded_by` | String (255) | ❌ | — | User ID |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

---

### 2.9 `notifications_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user_id` | String (255) | ✅ | — | Recipient |
| `company_id` | String (255) | ✅ | — | |
| `title` | String (255) | ✅ | — | |
| `message` | String (255) | ✅ | — | |
| `type` | String (255) | ✅ | — | e.g. LEAVE_APPROVED |
| `read` | Boolean | ✅ | — | |
| `created_at` | Datetime | ✅ | — | |

**Indexes:**
- `user_index` → key on `user_id` ASC
- `company_index` → key on `company_id` ASC

---

### 2.10 `audit_logs_collection`

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `company_id` | String (255) | ✅ | — | |
| `user_id` | String (255) | ✅ | — | Who performed the action |
| `action` | String (255) | ✅ | — | e.g. LEAVE_APPROVED |
| `resource_type` | String (255) | ❌ | — | e.g. leave |
| `resource_id` | String (255) | ❌ | — | |
| `details` | String (4096) | ❌ | — | JSON metadata |
| `created_at` | Datetime | ✅ | — | |

**Indexes:**
- `company_index` → key on `company_id` ASC

---

### 2.11 `notification_preferences_collection` ⭐ (Critical — was missing)

Stores per-user notification toggle settings.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user_id` | String (255) | ✅ | — | FK → users |
| `push_enabled` | Boolean | ❌ | true | Push notifications on/off |
| `email_enabled` | Boolean | ❌ | true | Email notifications on/off |
| `sms_enabled` | Boolean | ❌ | false | SMS notifications on/off |
| `leave_notifications` | Boolean | ❌ | true | Leave-related alerts |
| `salary_notifications` | Boolean | ❌ | true | Payroll/salary alerts |
| `attendance_notifications` | Boolean | ❌ | true | Attendance alerts |
| `announcement_notifications` | Boolean | ❌ | true | HR announcements |
| `do_not_disturb_start` | String (10) | ❌ | — | HH:MM — quiet hours start |
| `do_not_disturb_end` | String (10) | ❌ | — | HH:MM — quiet hours end |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `user_index` → **unique** key on `user_id` ASC (enforces one preferences document per user)

---

### 2.12 `device_tokens_collection`

Stores Expo/APNs/FCM push tokens for each user device.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `user_id` | String (255) | ✅ | — | |
| `device_token` | String (1024) | ✅ | — | Expo / APNs / FCM token |
| `device_name` | String (255) | ❌ | — | Human-readable device label |
| `platform` | String (32) | ✅ | — | expo / ios / android / web |
| `is_active` | Boolean | ❌ | true | |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `user_index` → key on `user_id` ASC
- `token_index` → key on `device_token` ASC
- `user_is_active_index` → composite key on `user_id` ASC, `is_active` ASC (supports `user_id + is_active` queries)
- `user_device_token_index` → composite key on `user_id` ASC, `device_token` ASC (supports `user_id + device_token` lookups)

---

### 2.13 `notification_logs_collection`

Records every notification delivery attempt for debugging and retries.

| Attribute | Type | Required | Default | Notes |
|---|---|---|---|---|
| `notification_id` | String (255) | ✅ | — | FK → notifications |
| `user_id` | String (255) | ✅ | — | Recipient |
| `channel` | String (32) | ✅ | — | push / email / sms |
| `status` | String (32) | ✅ | — | pending / sent / failed / retrying |
| `error_message` | String (1024) | ❌ | — | Error detail if failed |
| `retry_count` | Integer | ❌ | 0 | |
| `created_at` | Datetime | ❌ | — | |
| `updated_at` | Datetime | ❌ | — | |

**Indexes:**
- `user_index` → key on `user_id` ASC
- `notification_index` → key on `notification_id` ASC

---

## Step 3 — Create Storage Buckets

Navigate to **Storage** → **Create bucket** for each bucket below.

| Bucket ID | Name | Max file size | Allowed types |
|---|---|---|---|
| `employee_documents` | Employee Documents | 10 MB | pdf, doc, docx, jpg, png |
| `payslips` | Payslips | 5 MB | pdf |
| `company_logos` | Company Logos | 2 MB | jpg, jpeg, png, svg |

**Permissions for each bucket:** role `users` → Read / Create / Update / Delete

---

## Step 4 — Configure Messaging Topics (optional)

Navigate to **Messaging** → **Topics** if you want broadcast push support:

| Topic ID | Name | Description |
|---|---|---|
| `all-employees` | All Employees | Company-wide announcements |
| `managers` | Managers | Manager-level alerts |
| `payroll-updates` | Payroll Updates | Salary processing notifications |

---

## Step 5 — Configure Auth

1. **Auth** → **Settings** → enable **Email/Password** sign-in
2. Set session duration to your preference (default 30 days is fine)
3. Add your app's URL schemes to the **Platforms** list:
   - Web: `http://localhost:8081` (dev), your production URL
   - iOS: `appwrite-callback-69ca44f20000ebf91141`
   - Android: `appwrite-callback-69ca44f20000ebf91141`

---

## Step 6 — Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=69ca44f20000ebf91141
EXPO_PUBLIC_APPWRITE_DATABASE_ID=69ca4ebb0005b6c43a63

# Collection IDs (defaults match appwrite.json — only override if you used custom IDs)
EXPO_PUBLIC_USERS_COLLECTION=users_collection
EXPO_PUBLIC_EMPLOYEES_COLLECTION=employees_collection
EXPO_PUBLIC_ATTENDANCE_COLLECTION=attendance_collection
EXPO_PUBLIC_LEAVES_COLLECTION=leaves_collection
EXPO_PUBLIC_PAYROLL_STRUCTURE_COLLECTION=payroll_structure_collection
EXPO_PUBLIC_PAYSLIPS_COLLECTION=payslips_collection
EXPO_PUBLIC_DOCUMENTS_COLLECTION=documents_collection
EXPO_PUBLIC_NOTIFICATIONS_COLLECTION=notifications_collection
EXPO_PUBLIC_DEVICE_TOKENS_COLLECTION=device_tokens_collection
EXPO_PUBLIC_NOTIFICATION_PREFERENCES_COLLECTION=notification_preferences_collection
EXPO_PUBLIC_NOTIFICATION_LOGS_COLLECTION=notification_logs_collection
EXPO_PUBLIC_AUDIT_LOGS_COLLECTION=audit_logs_collection
EXPO_PUBLIC_COMPANIES_COLLECTION=companies_collection

# Storage bucket IDs
EXPO_PUBLIC_DOCUMENTS_BUCKET=employee_documents
EXPO_PUBLIC_PAYSLIPS_BUCKET=payslips
EXPO_PUBLIC_COMPANY_LOGOS_BUCKET=company_logos
```

---

## Step 7 — Deploy with Appwrite CLI (optional, fastest path)

If you prefer not to click through the Console manually:

```bash
# Install CLI
npm install -g appwrite-cli

# Login
appwrite login

# Deploy everything from appwrite.json
appwrite deploy --all
```

This deploys all collections, indexes, buckets, and topics defined in `appwrite.json` automatically.

---

## Troubleshooting

### "Collection with the requested ID '...' could not be found"

The collection ID in the code does not exist in the Appwrite database.

**Fix:**
1. Check `src/config/env.ts` → `DB_IDS` for the collection key
2. Verify the collection exists in the Appwrite Console under your database
3. If missing, create it using the schema in Step 2 above

### "Document with requested ID could not be found"

A document lookup is failing. Ensure:
- The document ID is correct
- The collection has the right permissions
- The query fields match the attribute names exactly (snake_case)

### "Invalid query: Attribute not found"

You are querying a field that does not exist as an **indexed** attribute.

**Fix:** Add the attribute and create an index on it in the Appwrite Console.

### Auth errors (401 / 403)

- Verify the session is active (`account.get()`)
- Check collection permissions include the `users` role
- Ensure the user's `company_id` matches what is being queried

---

## Collection ID Reference

| `DB_IDS` key | Collection ID |
|---|---|
| `USERS` | `users_collection` |
| `COMPANIES` | `companies_collection` |
| `EMPLOYEES` | `employees_collection` |
| `ATTENDANCE` | `attendance_collection` |
| `LEAVES` | `leaves_collection` |
| `PAYROLL_STRUCTURE` | `payroll_structure_collection` |
| `PAYSLIPS` | `payslips_collection` |
| `DOCUMENTS` | `documents_collection` |
| `NOTIFICATIONS` | `notifications_collection` |
| `DEVICE_TOKENS` | `device_tokens_collection` |
| `NOTIFICATION_PREFERENCES` | `notification_preferences_collection` |
| `NOTIFICATION_LOGS` | `notification_logs_collection` |
| `AUDIT_LOGS` | `audit_logs_collection` |
