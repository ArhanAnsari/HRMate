# HRMate - Enterprise HR Management Platform

A production-ready React Native + Expo application for comprehensive human resources management, built with TypeScript, Appwrite backend, and premium SaaS-level architecture.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [API & Services](#api--services)
- [Security](#security)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Deployment](#deployment)

## ✨ Features

### Core Features

- **Employee Management**
  - Add, update, delete employee records
  - Role-based access control (RBAC)
  - Employee profile management
  - Bulk import functionality

- **Attendance Tracking**
  - Real-time attendance marking
  - Biometric authentication (fingerprint/face recognition)
  - Attendance history and reports
  - Automated notifications

- **Leave Management**
  - Request/approve leaves with workflow
  - Multiple leave types (sick, vacation, personal)
  - Leave balance tracking
  - Approval notifications

- **Payroll Management**
  - Salary calculation and processing
  - Payslip generation and distribution
  - Tax calculations
  - Payment history tracking

- **Chat & Communication**
  - Real-time internal messaging
  - Department-wide announcements
  - Message notifications
  - Chat history

- **Analytics & Insights**
  - Employee attendance statistics
  - Leave utilization charts
  - Payroll analytics
  - Department-level dashboards

- **Offline Support**
  - Works seamlessly without internet
  - Automatic sync when connection restored
  - Cached data for critical features

- **Security Features**
  - Role-based access control (RBAC)
  - Input sanitization and validation
  - Rate limiting for sensitive operations
  - Encrypted secure storage for tokens
  - Biometric authentication

### Premium UI/UX

- Dark mode and light mode support
- Responsive design for all screen sizes
- Smooth animations and transitions
- Haptic feedback for interactions
- Accessible component patterns
- Premium design system (colors, spacing, typography)

## 🏗️ Architecture

HRMate follows a layered, modular architecture optimized for scalability, maintainability, and testability.

```
┌─────────────────────────────────────────────────────┐
│              UI Layer (Screens)                      │
│  ├─ Authentication (login, signup, forgot password) │
│  ├─ Dashboard (home, insights)                      │
│  ├─ Employees (list, detail, edit)                  │
│  ├─ Attendance (tracking, history)                  │
│  ├─ Leaves (request, approve, history)              │
│  ├─ Payroll (processing, payslips)                  │
│  ├─ Chat (messaging)                                │
│  └─ Settings (profile, preferences)                 │
├─────────────────────────────────────────────────────┤
│        Component Layer (Reusable UI)                 │
│  ├─ Patterns (LoadingList, DataCard, FormWrapper)   │
│  ├─ Layout Components                               │
│  ├─ Shared Components (buttons, inputs, etc)        │
│  └─ Theme-aware Components                          │
├─────────────────────────────────────────────────────┤
│         Hook Layer (Data & Logic)                    │
│  ├─ useData (generic async hook)                    │
│  ├─ useEmployees, useAttendance, useLeaves, etc     │
│  ├─ useCompanyId, useColorScheme                    │
│  └─ Custom domain-specific hooks                    │
├─────────────────────────────────────────────────────┤
│        Service Layer (Business Logic)                │
│  ├─ API Services (employees, attendance, etc)       │
│  ├─ Auth Service (login, logout, tokens)            │
│  ├─ Security Service (sanitization, validation)     │
│  ├─ Rate Limiter (brute force protection)           │
│  ├─ Secure Storage (encrypted token storage)        │
│  ├─ Notifications, Activity Logs, Search            │
│  └─ Other Domain Services                           │
├─────────────────────────────────────────────────────┤
│        Error Layer (Error Handling)                  │
│  ├─ AppError (base error class)                     │
│  ├─ AuthError, ValidationError, etc                 │
│  ├─ handleError() utility                           │
│  └─ Type-safe error discrimination                  │
├─────────────────────────────────────────────────────┤
│       State Management (Zustand)                     │
│  ├─ Auth state (tokens, user info)                  │
│  ├─ UI state (theme, navigation)                    │
│  └─ Cache state (with AsyncStorage persistence)     │
├─────────────────────────────────────────────────────┤
│       Backend (Appwrite)                             │
│  ├─ Collections (employees, attendance, etc)        │
│  ├─ Authentication                                  │
│  ├─ Permissions (role-based)                        │
│  └─ Real-time subscriptions                         │
└─────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Each layer has specific responsibilities
2. **Type Safety**: 100% TypeScript coverage with strict mode
3. **Error Handling**: Centralized custom error classes
4. **Reusability**: DRY principle with shared components and hooks
5. **Testability**: Pure functions and dependency injection
6. **Performance**: Memoization, lazy loading, caching strategies
7. **Accessibility**: WCAG 2.1 AA compliant components
8. **Security**: Multi-layered protection (input sanitization, rate limiting, encryption)

## 💻 Tech Stack

### Frontend

- **Framework**: React Native + Expo
- **Language**: TypeScript 5.x
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: Expo Router (file-based routing)
- **Styling**: Custom theme system with dark mode support
- **Icons**: MaterialCommunityIcons

### Backend

- **Database**: Appwrite (self-hosted or cloud)
- **Authentication**: Appwrite Auth
- **Real-time**: Appwrite Realtime
- **File Storage**: Appwrite Storage

### Security

- **Encryption**: expo-secure-store (encrypted storage)
- **Biometric**: expo-local-authentication
- **Input Validation**: Custom SecurityService

### Development

- **Build Tool**: Expo CLI
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Testing**: Jest (configured, see PHASE16_TESTING.md)
- **Version Control**: Git

### Native Modules

- expo-local-authentication (biometric)
- expo-notifications (push notifications)
- expo-file-system (file operations)
- expo-secure-store (encrypted storage)
- expo-clipboard (clipboard operations)
- react-native-chart-kit (charts and graphs)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Appwrite server running (local or cloud)
- iOS/Android development environment (for native build)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd HRMate
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Appwrite**
   - Open `src/config/env.ts`
   - Update with your Appwrite server URL, project ID, API key
   - Run setup: `npm run setup:appwrite` (optional)

4. **Configure environment variables**
   - Create `.env` file with API endpoints
   - Update Gemini API key for AI features (optional)

5. **Start development server**

   ```bash
   npm start
   # or
   expo start
   ```

6. **Test on device**
   - Press `w` for web preview
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

### Docker Setup (Optional)

For running Appwrite locally:

```bash
docker pull appwrite/appwrite:latest
docker run -d --name appwrite -p 80:80 -p 443:443 appwrite/appwrite
```

## 📁 Project Structure

```
HRMate/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth screens with layout
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (dashboard)/              # Main app screens with layout
│   │   ├── index.tsx             # Home/Dashboard
│   │   ├── employees.tsx
│   │   ├── attendance.tsx
│   │   ├── leaves.tsx
│   │   ├── payroll.tsx
│   │   ├── chat.tsx
│   │   ├── insights.tsx
│   │   ├── payslips.tsx
│   │   ├── profile.tsx
│   │   ├── settings.tsx
│   │   └── bulk-import.tsx
│   ├── (tabs)/                   # Tab-based navigation
│   │   └── index.tsx
│   ├── _layout.tsx               # Root layout
│   └── modal.tsx                 # Modal screens
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── patterns/             # Component patterns (Phase 15)
│   │   │   └── index.tsx         # LoadingList, DataCard, FormWrapper
│   │   ├── shared/               # Shared components
│   │   ├── ui/                   # Basic UI components
│   │   ├── layout/               # Layout components
│   │   ├── ErrorBoundary.tsx     # Error boundary
│   │   ├── OfflineIndicator.tsx  # Offline status
│   │   └── NotificationCenter.tsx # Notifications UI
│   │
│   ├── services/                 # Business logic & API
│   │   ├── errors/
│   │   │   └── AppError.ts       # Custom error classes (Phase 15)
│   │   ├── security/             # Security services (Phase 17)
│   │   │   ├── SecurityService.ts # Sanitization & validation
│   │   │   ├── RateLimiter.ts    # Brute force protection
│   │   │   └── SecureStorageService.ts # Encrypted storage
│   │   ├── appwrite.ts           # Appwrite client setup
│   │   ├── auth.service.ts       # Authentication
│   │   ├── employees.service.ts  # Employee management
│   │   ├── attendance.service.ts # Attendance tracking
│   │   ├── leaves.service.ts     # Leave management
│   │   ├── payroll.service.ts    # Payroll processing
│   │   ├── notifications.service.ts # Notifications
│   │   ├── activity-logs.service.ts # Activity logging
│   │   ├── search.service.ts     # Full-text search
│   │   ├── ai.service.ts         # AI/ML features
│   │   └── [other-services]
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useData.ts            # Generic async hook (Phase 15)
│   │   ├── useCompanyId.ts       # Company ID context
│   │   ├── useColorScheme.ts     # Dark mode detection
│   │   └── use-theme-color.ts    # Theme color hook
│   │
│   ├── state/                    # Zustand stores
│   │   ├── auth.ts               # Auth state
│   │   ├── ui.ts                 # UI state
│   │   ├── employees.ts          # Employees cache
│   │   ├── attendance.ts         # Attendance cache
│   │   └── [other-stores]
│   │
│   ├── lib/                      # Utility functions
│   │   └── [utilities]
│   │
│   ├── constants/                # Constants
│   │   ├── colors.ts             # Color palette
│   │   ├── spacing.ts            # Spacing tokens
│   │   ├── routes.ts             # Route names
│   │   └── index.ts              # General constants
│   │
│   ├── types/                    # TypeScript types
│   │   └── [type definitions]
│   │
│   └── theme/                    # Design system
│       └── THEME.ts              # Comprehensive theme tokens
│
├── constants/                    # Global constants
│   └── theme.ts
│
├── components/                   # Expo default components
│   └── [basic components]
│
├── assets/                       # Images, fonts, etc
│   └── images/
│
├── scripts/                      # Setup and utility scripts
│   ├── setup-appwrite.js
│   └── reset-project.js
│
├── Documentation/                # Comprehensive docs
│   ├── PHASE15_IMPLEMENTATION_COMPLETE.md
│   ├── PHASE17_SECURITY_COMPLETE.md
│   ├── PHASE16_TESTING.md
│   ├── DEVELOPER_GUIDE.md
│   ├── IMPLEMENTATION_GUIDE_PREMIUM.md
│   └── [other docs]
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── app.json                     # Expo config
├── eslint.config.js             # ESLint config
└── README.md                    # This file
```

## 📚 Development Guide

### 1. Adding a New Feature

#### Step 1: Create the Service

```typescript
// src/services/newFeature.service.ts
import { appwriteClient } from "./appwrite";
import { handleError } from "./errors/AppError";

export const NewFeatureService = {
  async fetchData(companyId: string) {
    try {
      const response = await appwriteClient.databases.listDocuments(
        process.env.EXPO_PUBLIC_DB_ID || "",
        "newfeature",
        [Query.equal("companyId", companyId)],
      );
      return response.documents;
    } catch (error) {
      throw handleError(error);
    }
  },
  // ... more methods
};
```

#### Step 2: Create the Hook (Phase 15)

```typescript
// src/hooks/useData.ts - Add new domain hook
export const useNewFeature = (companyId: string) => {
  return useAsync(() => NewFeatureService.fetchData(companyId), true);
};
```

#### Step 3: Create the Screen

```typescript
// app/(dashboard)/newfeature.tsx
import { useNewFeature } from '@/src/hooks/useData';
import { LoadingList, DataCard } from '@/src/components/patterns';

export default function NewFeatureScreen() {
  const { data, loading, error } = useNewFeature(companyId);

  if (loading) return <LoadingList count={5} />;

  return (
    <ScrollView>
      {data?.map(item => (
        <DataCard key={item.$id} title={item.name}>
          {/* Card content */}
        </DataCard>
      ))}
    </ScrollView>
  );
}
```

### 2. Implementing Security (Phase 17)

#### Input Validation

```typescript
import { SecurityService } from "@/src/services/security/SecurityService";

const name = SecurityService.sanitizeInput(userInput, {
  maxLength: 100,
  allowSpecial: false,
});
```

#### Rate Limiting

```typescript
import { RateLimiter } from "@/src/services/security/RateLimiter";

const { blocked, attemptsRemaining } = await RateLimiter.recordAttempt(
  email,
  RateLimiter.LOGIN_LIMIT,
);

if (blocked) throw new Error("Too many attempts");
```

#### Secure Storage

```typescript
import { SecureStorageService } from "@/src/services/security/SecureStorageService";

// Store tokens securely
await SecureStorageService.storeAuthToken(accessToken, refreshToken);

// Retrieve tokens
const { token } = await SecureStorageService.getAuthTokens();

// Clear on logout
await SecureStorageService.clearAllSecure();
```

### 3. Using Component Patterns (Phase 15)

#### LoadingList - Data state management

```typescript
<LoadingList
  count={5}
  emptyText="No items found"
  renderItem={(index) => <SkeletonCard key={index} />}
/>
```

#### DataCard - Entity display

```typescript
<DataCard
  title="John Doe"
  subtitle="Senior Developer"
  icon="account"
  badge="Active"
  onPress={() => navigate('profile')}
>
  <Text>Additional details here</Text>
</DataCard>
```

#### FormWrapper - Standardized forms

```typescript
<FormWrapper title="Add Employee" onSubmit={handleSubmit}>
  <TextInput placeholder="Name" />
  <TextInput placeholder="Email" />
  <SubmitButton>Save</SubmitButton>
</FormWrapper>
```

### 4. Error Handling

All errors are converted to `AppError` for consistent handling:

```typescript
import {
  AppError,
  handleError,
  AuthError,
} from "@/src/services/errors/AppError";

try {
  await authService.login(email, password);
} catch (error) {
  const appError = handleError(error);

  if (appError instanceof AuthError) {
    showAlert("Invalid credentials");
  } else if (appError instanceof ValidationError) {
    showAlert(appError.message);
  } else {
    showAlert("Something went wrong");
  }
}
```

### 5. Working with Themes

Access theme system:

```typescript
import { THEME } from "@/src/theme/THEME";
import { useColorScheme } from "@/src/hooks/use-color-scheme";

const isDark = useColorScheme() === "dark";

const styles = StyleSheet.create({
  container: {
    backgroundColor: isDark
      ? THEME.dark.background.primary
      : THEME.light.background.primary,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.radius.lg,
    shadowColor: THEME.dark.shadow,
  },
});
```

See `src/theme/THEME.ts` for complete design system:

- **Colors**: Primary, secondary, accent, text, background, status colors
- **Spacing**: xs, sm, md, lg, xl, xxl
- **Typography**: Font sizes, weights, line heights
- **Radius**: Rounded corners (sm, md, lg, xl, full)
- **Shadows**: Elevation levels (sm, md, lg)

## 🔌 API & Services

### Authentication Service

```typescript
// Login
const { sessionId, tokens } = await AuthService.login(email, password);

// Sign up
const user = await AuthService.signup(email, password, name);

// Refresh token
const newToken = await AuthService.refreshToken();

// Logout
await AuthService.logout();

// Get current user
const user = await AuthService.getCurrentUser();
```

### Employee Service

```typescript
// Fetch employees
const employees = await EmployeeService.getEmployees(companyId);

// Get single employee
const employee = await EmployeeService.getEmployee(employeeId);

// Create employee
const newEmp = await EmployeeService.createEmployee({ name, email, ... });

// Update employee
await EmployeeService.updateEmployee(employeeId, { name, ... });

// Delete employee
await EmployeeService.deleteEmployee(employeeId);

// Bulk import
const results = await EmployeeService.bulkImport(csvData, companyId);
```

### Attendance Service

```typescript
// Mark attendance
await AttendanceService.markAttendance(employeeId, { checkIn, location, ... });

// Get attendance history
const history = await AttendanceService.getAttendanceHistory(employeeId);

// Get statistics
const stats = await AttendanceService.getStats(companyId, startDate, endDate);

// Export report
const csv = await AttendanceService.exportReport(companyId, dateRange);
```

### Leave Service

```typescript
// Request leave
const request = await LeaveService.requestLeave(employeeId, {
  startDate,
  endDate,
  type,
  reason,
});

// Approve/reject leave
await LeaveService.updateLeaveStatus(leaveId, "approved", approverNote);

// Get leave balance
const balance = await LeaveService.getLeaveBalance(employeeId);

// Get leave history
const history = await LeaveService.getLeaveHistory(employeeId);
```

### Payroll Service

```typescript
// Create payroll
const payroll = await PayrollService.createPayroll(companyId, {
  startDate,
  endDate,
  salaries,
});

// Generate payslip
const payslip = await PayrollService.generatePayslip(payrollId, employeeId);

// Get payslip history
const slips = await PayrollService.getPayslipHistory(employeeId);

// Calculate taxes
const taxAmount = PayrollService.calculateTax(gross, companyId);
```

### Notification Service

```typescript
// Send notification
await NotificationService.send(recipientId, {
  title: "Leave Approved",
  body: "Your leave request has been approved",
  data: { redirectTo: "leaves" },
});

// Get notifications
const notifications = await NotificationService.getNotifications(userId);

// Mark as read
await NotificationService.markAsRead(notificationId);
```

### Chat Service

```typescript
// Send message
await ChatService.sendMessage(conversationId, {
  text: "Hello",
  type: "text",
});

// Get conversation
const messages = await ChatService.getMessages(conversationId);

// Create conversation
const conv = await ChatService.createConversation(participantIds);

// Subscribe to real-time messages
ChatService.subscribeToMessages(conversationId, (newMsg) => {
  // Handle new message
});
```

### Security Service (Phase 17)

```typescript
// Sanitize HTML input
const safe = SecurityService.sanitizeHtml(userInput);

// Sanitize general input
const clean = SecurityService.sanitizeInput(userInput, {
  maxLength: 100,
  allowSpecial: false,
});

// Validate email
const isValid = SecurityService.validateEmail(email);

// Validate password strength
const strength = SecurityService.validatePasswordStrength(password);
// Returns: { score, feedback: string[] }

// Escape HTML entities
const escaped = SecurityService.escapeHtml(text);

// Sanitize filename (prevent directory traversal)
const safe = SecurityService.sanitizeFileName(filename);

// Validate URL
const isValid = SecurityService.validateUrl(url);
```

### Rate Limiter (Phase 17)

```typescript
// Pre-configured limits
RateLimiter.LOGIN_LIMIT; // 5 attempts per 15 minutes
RateLimiter.API_LIMIT; // 100 requests per minute
RateLimiter.PASSWORD_RESET_LIMIT; // 3 attempts per hour

// Record attempt and check if blocked
const { blocked, attemptsRemaining, resetTime } =
  await RateLimiter.recordAttempt(identifier, limit);

// Check current status
const { blocked, remaining } = await RateLimiter.isBlocked(identifier, limit);

// Get remaining attempts
const remaining = await RateLimiter.getRemainingAttempts(identifier, limit);

// Reset limit
await RateLimiter.reset(identifier, limit);
```

### Secure Storage Service (Phase 17)

```typescript
// Store securely (encrypted)
await SecureStorageService.setSecure("key", value);
const value = await SecureStorageService.getSecure("key");

// Store standard (OS-protected)
await SecureStorageService.setStandard("key", value);
const value = await SecureStorageService.getStandard("key");

// Auth token management
await SecureStorageService.storeAuthToken(accessToken, refreshToken);
const { token, refreshToken } = await SecureStorageService.getAuthTokens();
await SecureStorageService.clearAllSecure(); // On logout
```

## 🔒 Security

HRMate implements a comprehensive, multi-layered security architecture:

### Phase 17 Security Implementation

#### 1. Input Sanitization

- **XSS Prevention**: HTML entity escaping, script tag removal
- **SQL Injection Prevention**: Parameterized queries via Appwrite SDK
- **Command Injection Prevention**: Input validation and restrictions
- **Path Traversal Prevention**: Filename sanitization

```typescript
// All user input is sanitized before processing
const cleanInput = SecurityService.sanitizeInput(userInput, {
  maxLength: 255,
  allowSpecial: false,
});
```

#### 2. Rate Limiting

- **Login Attempts**: 5 attempts per 15 minutes (account lockout)
- **API Requests**: 100 requests per minute (DoS prevention)
- **Password Reset**: 3 attempts per hour (brute force prevention)
- **Custom Limits**: Define additional limits as needed

```typescript
// Enforced before auth attempts
const { blocked } = await RateLimiter.recordAttempt(
  email,
  RateLimiter.LOGIN_LIMIT,
);
if (blocked) throw new Error("Too many attempts. Try again later.");
```

#### 3. Encrypted Storage

- **Tokens**: Stored in expo-secure-store (encrypted)
- **Credentials**: Never stored in AsyncStorage
- **Sensitive Data**: Always use SecureStorageService.setSecure()

```typescript
// Tokens automatically encrypted during storage
await SecureStorageService.storeAuthToken(accessToken, refreshToken);
```

#### 4. Role-Based Access Control (RBAC)

- **Hierarchy**: Super Admin > Company Admin > Manager > Employee
- **Permissions**: Checked on frontend and backend
- **Collections**: Appwrite permissions ensure data isolation

```typescript
// Permissions automatically enforced via rbac.ts utility
const canApproveLeaves = userHasPermission("can:approve:leaves");
```

#### 5. Biometric Authentication

- **Mobile**: Fingerprint + Face recognition via expo-local-authentication
- **Optional**: MFA for critical operations
- **Session**: Biometric tokens stored securely

```typescript
// Optional biometric auth on sensitive operations
const authenticated = await BiometricService.authenticate();
```

#### 6. Data Encryption

- **At Rest**: Database-level encryption (Appwrite)
- **In Transit**: HTTPS/TLS for all API calls
- **Fields**: PII fields encrypted at application level

#### 7. Security Headers

- **CSP**: Content Security Policy configured
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking prevention
- **X-Content-Type-Options**: MIME-sniffing prevention

See `SecurityService.getSecurityHeaders()` for complete configuration.

#### 8. Error Handling & Logging

- **Generic Errors**: Users see generic error messages
- **Detailed Logs**: Sensitive details logged server-side only
- **Activity Logging**: All operations logged with user/timestamp/action

### Security Checklist

- ✅ Input validation on all user inputs
- ✅ Rate limiting on authentication endpoints
- ✅ Secure token storage (encrypted)
- ✅ RBAC with Appwrite permissions
- ✅ HTML escaping for XSS prevention
- ✅ HTTPS/TLS for all communications
- ✅ Activity logging for audit trail
- ✅ Password strength validation
- ✅ Session management with refresh tokens
- ✅ Biometric authentication support
- ✅ CORS properly configured
- ✅ Environment variables for secrets

### OWASP Top 10 Coverage

1. ✅ **Broken Access Control**: RBAC + Appwrite permissions
2. ✅ **Cryptographic Failures**: TLS in transit, encryption at rest
3. ✅ **Injection**: Parameterized queries, input sanitization
4. ✅ **Insecure Design**: Security-first architecture (Phase 17)
5. ✅ **Security Misconfiguration**: Environment-based config
6. ✅ **Vulnerable Components**: Regular dependency updates
7. ✅ **Authentication Failures**: Rate limiting + secure storage
8. ✅ **Data Integrity Failures**: Digital signatures + checksums
9. ✅ **Logging & Monitoring**: Activity logging service
10. ✅ **Client-Side Attacks**: CSP headers, XSS prevention

## ⚡ Performance

### Performance Optimizations (Phase 18)

1. **Memoization**
   - Components wrapped with `React.memo`
   - Callbacks memoized with `useCallback`
   - Values memoized with `useMemo`

2. **Lazy Loading**
   - Routes use dynamic imports
   - Images optimized and cached
   - Heavy components loaded on-demand

3. **Caching Strategy**
   - 5-minute TTL for API responses
   - Offline cache via AsyncStorage
   - Incremental cache invalidation

4. **Bundle Optimization**
   - Tree shaking enabled
   - Code splitting by route
   - Unused modules removed
   - Icons lazily loaded

5. **Rendering Optimization**
   - Virtual lists for large datasets
   - FlatList with optimized renderItem
   - Minimal re-renders via proper dependencies
   - PureComponent where applicable

6. **Network Optimization**
   - Request batching for bulk operations
   - Compressed payloads
   - HTTP/2 multiplexing
   - Background sync for offline changes

### Monitoring Performance

```bash
# Check bundle size
npm run analyze

# Run performance audit
npm run performance:audit

# Profile rendering
npm run performance:profile
```

## 🐛 Troubleshooting

### Common Issues

#### **Issue**: "Environment variable not defined"

**Solution**:

```bash
# Check src/config/env.ts
# Ensure variables are set in app.json
# For Expo Go, use EXPO_PUBLIC_ prefix
EXPO_PUBLIC_APPWRITE_URL=...
EXPO_PUBLIC_APPWRITE_PROJECT_ID=...
```

#### **Issue**: "Biometric authentication not working"

**Solution**:

- Ensure `expo-local-authentication` is installed: `npx expo install expo-local-authentication`
- Device must have biometric hardware
- User must enroll biometric data in device settings
- App needs biometric permission in `app.json`

```json
{
  "plugins": [["expo-local-authentication", {}]]
}
```

#### **Issue**: "Notifications not appearing"

**Solution**:

```bash
# Install expo-notifications
npx expo install expo-notifications

# Ensure service is configured
# Check APPWRITE_SETUP.md for notification setup
# Verify notification permissions in app.json
```

#### **Issue**: "Dark mode not working"

**Solution**:

```typescript
// Ensure useColorScheme is being used
import { useColorScheme } from "@/src/hooks/use-color-scheme";

const isDark = useColorScheme() === "dark";
const bgColor = isDark
  ? THEME.dark.background.primary
  : THEME.light.background.primary;
```

#### **Issue**: "Offline sync not working"

**Solution**:

- Install offline support package: `npm install @react-native-async-storage/async-storage`
- Ensure services implement offline queueing
- Check AsyncStorage for pending operations
- Verify network state detection

#### **Issue**: "Rate limiting too aggressive"

**Solution**:

```typescript
// Adjust limits in RateLimiter.ts
LOGIN_LIMIT: { attempts: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min
API_LIMIT: { attempts: 200, windowMs: 60 * 1000 }, // 200 per minute
```

#### **Issue**: "TypeScript errors after adding feature"

**Solution**:

```bash
# Regenerate types
npm run type:check

# Enable strict mode gradually
# In tsconfig.json: "strict": true

# Fix type issues
npm run type:fix
```

#### **Issue**: "Appwrite connection failing"

**Solution**:

```bash
# Verify Appwrite is running
curl http://localhost/v1/health

# Check credentials in env.ts
# Ensure network connectivity to Appwrite server
# Check browser console for CORS errors
```

### Debug Mode

Enable debug logging:

```typescript
// In any service or component:
import { DEBUG } from "@/src/constants";

if (DEBUG) {
  console.log("[EmployeeService]", "Fetching employees...", companyId);
}
```

### Performance Debugging

```typescript
// Measure component render time
import { measurePerformance } from "@/src/utils/performance";

const result = await measurePerformance("operationName", async () => {
  // Your code here
});
console.log(`Operation took ${result.duration}ms`);
```

## 🤝 Contributing

### Code Style Guide

1. **File Naming**
   - Components: PascalCase (e.g., `EmployeeCard.tsx`)
   - Services: camelCase + `.service.ts` (e.g., `employee.service.ts`)
   - Utilities: camelCase + `.utils.ts` (e.g., `format.utils.ts`)
   - Types: camelCase + `.types.ts` (e.g., `employee.types.ts`)
   - Hooks: camelCase + `use` prefix (e.g., `useEmployees.ts`)

2. **TypeScript Best Practices**
   - Always define types, never use `any`
   - Use interfaces for object structures
   - Use enums for constants
   - Strict null checks enabled
   - Use discriminated unions for better type inference

3. **Component Guidelines**
   - Functional components with hooks
   - Props interface defined above component
   - Memoization for heavy components
   - Custom hooks for logic extraction
   - Dark mode support required

4. **Error Handling**
   - Always use `handleError()` for consistency
   - Create specific error types when needed
   - Provide user-friendly error messages
   - Log detailed errors for debugging

5. **Performance**
   - Avoid inline function definitions
   - Use `useCallback` for event handlers
   - Use `useMemo` for expensive calculations
   - Profile before optimizing

6. **Testing**
   - Unit tests for services
   - Integration tests for complex features
   - Component snapshot tests
   - API mock tests

### Commit Message Format

```
feat: Add new feature
fix: Fix bug or issue
docs: Documentation changes
refactor: Code refactoring
perf: Performance improvements
test: Add/update tests
chore: Dependencies/config changes
```

Example:

```
feat(attendance): Add biometric clock-in/out

- Integrate expo-local-authentication
- Add biometric fallback to PIN
- Update UI with biometric icon
- Add service for biometric verification
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -m 'feat: my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Create Pull Request with:
   - Clear description of changes
   - Motivation and context
   - Testing done
   - Screenshots (for UI changes)
5. Address review comments
6. Merge after approval

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/employee-export

# Make changes
# Run tests
npm test

# Type check
npm run type:check

# Lint code
npm run lint

# Format code
npm run format

# Commit and push
git add .
git commit -m "feat(employee): Add CSV export functionality"
git push origin feature/employee-export

# Create PR
```

## 🚀 Deployment

### Prerequisites

- Apple Developer Account (for iOS)
- Google Play Developer Account (for Android)
- Appwrite instance configured
- All environment variables set

### iOS Deployment

1. **Build for iOS**

   ```bash
   eas build --platform ios --auto-submit
   ```

2. **Configure App Store Connect**
   - Create app in App Store Connect
   - Set bundle identifier to match `app.json`
   - Add screenshots and description
   - Set up pricing tier

3. **Submit for Review**

   ```bash
   eas submit --platform ios --latest
   ```

4. **Release Steps**
   - TestFlight testing (optional but recommended)
   - Submit for App Store review
   - Monitor review status
   - Release when approved

### Android Deployment

1. **Build for Android**

   ```bash
   eas build --platform android --release-channel production
   ```

2. **Configure Google Play**
   - Create app in Google Play Console
   - Set package name to match `app.json`
   - Add screenshots, description, privacy policy
   - Set up pricing

3. **Submit to Play Store**

   ```bash
   eas submit --platform android --latest
   ```

4. **Release Steps**
   - Submit to beta track first
   - Test with beta users
   - Roll out gradually (25% → 50% → 100%)
   - Monitor crash reports and ratings

### Web Deployment (Optional)

```bash
# Build for web
npm run build:web

# Deploy to hosting
# Vercel, Netlify, Firebase Hosting, etc.
npm install -g vercel
vercel deploy
```

### Environment Configuration

**Production Variables** (`.env.production`):

```
EXPO_PUBLIC_APPWRITE_URL=https://api.example.com
EXPO_PUBLIC_APPWRITE_PROJECT_ID=prod-project-id
EXPO_PUBLIC_API_KEY=prod-api-key
DEBUG=false
```

**Staging Variables** (`.env.staging`):

```
EXPO_PUBLIC_APPWRITE_URL=https://staging-api.example.com
EXPO_PUBLIC_APPWRITE_PROJECT_ID=staging-project-id
EXPO_PUBLIC_API_KEY=staging-api-key
DEBUG=true
```

### Monitoring & Analytics

1. **Error Tracking**
   - Sentry integration (optional)
   - Detailed error logging
   - Real-time alerts

2. **Performance Monitoring**
   - App startup time
   - Screen render times
   - API response times
   - Battery/memory usage

3. **Usage Analytics**
   - Feature usage tracking
   - User engagement metrics
   - Session duration
   - Crash reports

### Rollback Procedure

```bash
# If issues found in production
# Revert to previous build:

eas build --platform ios --channel production-v1

# Or manage rollout percentage:
# Google Play Console → Release Management → Manage Rollout
# Set percentage to 0% to pause
# Review crash reports and metrics
```

## 📖 Additional Resources

### Documentation Files

- [Phase 15 - Architecture](./PHASE15_ARCHITECTURE.md)
- [Phase 16 - Testing](./PHASE16_TESTING.md)
- [Phase 17 - Security](./PHASE17_SECURITY_COMPLETE.md)
- [Phase 18 - Final Polish](./PHASE17_18_FINAL.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Premium Redesign](./PREMIUM_REDESIGN_SYSTEM.md)

### External Resources

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [OWASP Security Guide](https://owasp.org)

### Support & Community

- Discord: [Community Server]
- GitHub Issues: [Report bugs](https://github.com/yourorg/HRMate/issues)
- Email: support@hrmate.example.com
- Documentation: https://docs.hrmate.example.com

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Author & Contributors

- **Project Lead**: Your Name
- **Architecture**: Your Name
- **Security**: Your Name
- **UI/UX**: Your Name

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for full contributor list.

---

## Quick Reference Checklist

### Before Development

- [ ] Environment variables configured
- [ ] Appwrite running and accessible
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript types generated (`npm run type:check`)
- [ ] Development server running (`npm start`)

### During Development

- [ ] Code follows style guide
- [ ] Types properly defined (no `any`)
- [ ] Error handling implemented
- [ ] Dark mode support added
- [ ] Tests written for critical logic
- [ ] Performance impact assessed

### Before Release

- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type:check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] No console errors/warnings
- [ ] Tested on actual devices
- [ ] Screenshots and metadata prepared
- [ ] Release notes written
- [ ] Version bumped in `app.json`

### Production Deploy

- [ ] All checks passing
- [ ] Code reviewed and approved
- [ ] Staging deployment successful
- [ ] Performance metrics acceptable
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Deployment window scheduled

---

**Last Updated**: 2026
**Version**: 1.0.0
**Status**: 🟢 Production Ready
