# 🏗️ ARCHITECTURE QUALITY - Phase 15 Implementation Guide

**Status**: 📋 PLANNING PHASE  
**Target Completion**: Phase 15 Complete  
**Scope**: Architecture review, refactoring patterns, and code quality improvements

---

## 📊 Current Architecture Overview

### Project Structure

```
HRMate/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Authentication flow
│   ├── (dashboard)/             # Dashboard screens (8 tabs)
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # React Native components
│   │   ├── ui/                  # UI primitives
│   │   ├── layout/              # Layout components
│   │   ├── *Service*            # Feature-specific components
│   │   ├── ErrorBoundary.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── BiometricLogin.tsx
│   │   └── Charts.tsx
│   ├── config/                  # Configuration
│   │   └── env.ts              # Environment variables
│   ├── services/                # Business logic layer
│   │   ├── appwrite.ts
│   │   ├── appwriteClient.ts
│   │   ├── auth.service.ts
│   │   ├── attendance.service.ts
│   │   ├── domain.service.ts
│   │   ├── biometric.service.ts
│   │   ├── gemini-ai.service.ts
│   │   ├── notifications.service.ts
│   │   ├── payslip.service.ts
│   │   └── activity-logs.service.ts
│   ├── state/                   # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── notifications.store.ts
│   │   ├── biometric.store.ts
│   │   ├── offline.store.ts
│   │   ├── employee.store.ts
│   │   └── job.store.ts (helpers)
│   ├── utils/                   # Utility functions
│   │   ├── validation.service.ts
│   │   ├── export.service.ts
│   │   ├── search.service.ts
│   │   └── rbac.ts
│   ├── hooks/                   # React hooks
│   │   ├── useCompanyId.ts
│   │   ├── use-color-scheme.ts
│   │   └── use-theme-color.ts
│   ├── theme/                   # Design system
│   │   └── index.ts
│   └── types/                   # TypeScript types
│       ├── index.ts
│       ├── auth.types.ts
│       └── employee.types.ts
└── scripts/                     # Setup scripts
```

### Architectural Patterns Currently Implemented

- ✅ **Layered Architecture**: Components → Services → API
- ✅ **State Management**: Zustand with AsyncStorage
- ✅ **Dependency Injection**: Through store imports
- ✅ **Error Boundaries**: Graceful error handling
- ✅ **Utility Functions**: Validation, export, search
- ✅ **Design System**: THEME object

---

## 🎯 Phase 15 Improvements

### 1. Service Layer Consolidation

**Current Issue**: Multiple service files with overlapping concerns

**Improvement**: Organize services by domain

```
services/
├── auth/
│   ├── auth.service.ts
│   ├── biometric.service.ts
│   └── index.ts (exports)
├── hr/
│   ├── employees.service.ts
│   ├── attendance.service.ts
│   ├── leaves.service.ts
│   ├── payroll.service.ts
│   └── index.ts
├── communication/
│   ├── notifications.service.ts
│   ├── ai.service.ts
│   └── index.ts
├── data/
│   ├── export.service.ts
│   ├── import service.ts
│   └── index.ts
└── appwrite/
    ├── client.ts
    ├── queries.ts
    ├── mutations.ts
    └── index.ts
```

### Implementation Step 1: Create Service Index Files

```typescript
// src/services/auth/index.ts
export * from "./auth.service";
export * from "./biometric.service";
export { authService as default };

// src/services/hr/index.ts
export * from "./employees.service";
export * from "./attendance.service";
export * from "./leaves.service";
export * from "./payroll.service";

// Usage:
import { authService, BiometricService } from "@/src/services/auth";
import { employeeService, attendanceService } from "@/src/services/hr";
```

### 2. Custom Hooks Best Practices

**Create reusable data fetching hooks**

```typescript
// src/hooks/useEmployees.ts
import { useEffect, useState } from "react";
import { employeeService } from "@/src/services/hr";

export const useEmployees = (companyId?: string) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const data = await employeeService.getEmployees(companyId);
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [companyId]);

  return { employees, loading, error, refetch: () => {} };
};

// Usage in components:
export function EmployeesList() {
  const { employees, loading } = useEmployees();

  if (loading) return <LoadingSpinner />;
  return <FlatList data={employees} renderItem={...} />;
}
```

### 3. Component Composition Pattern

**Create wrapper components for common patterns**

```typescript
// src/components/patterns/LoadingList.tsx
interface LoadingListProps<T> {
  data: T[];
  loading: boolean;
  error?: string | null;
  emptyMessage?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export function LoadingList<T>({
  data,
  loading,
  error,
  emptyMessage = "No items",
  renderItem,
}: LoadingListProps<T>) {
  if (loading) return <ActivityIndicator />;
  if (error) return <ErrorMessage message={error} />;
  if (data.length === 0) return <EmptyState message={emptyMessage} />;

  return <FlatList data={data} renderItem={({ item, index }) => renderItem(item, index)} />;
}

// Usage:
<LoadingList
  data={employees}
  loading={loading}
  error={error}
  renderItem={(emp) => <EmployeeCard employee={emp} />}
/>
```

### 4. Store Organization

**Create store factory function**

```typescript
// src/state/createPersistStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const createPersistStore = <T>(
  name: string,
  initialState: T,
  handlers: (set: any) => any,
) => {
  return create<T>(
    persist(
      (set, get) => ({
        ...initialState,
        ...handlers({ set, get }),
      }),
      {
        name,
        storage: AsyncStorage,
      },
    ),
  );
};

// Usage:
export const useEmployeeStore = createPersistStore(
  "employee-store",
  { employees: [] },
  ({ set }) => ({
    setEmployees: (employees) => set({ employees }),
  }),
);
```

### 5. Type Safety Improvements

**Create generic types for common patterns**

```typescript
// src/types/common.types.ts
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Usage:
import { AsyncState } from "@/src/types";

const [state, setState] = useState<AsyncState<Employee[]>>({
  data: null,
  loading: false,
  error: null,
});
```

### 6. Error Handling Pattern

**Create custom error classes**

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number,
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super("AUTH_ERROR", message);
  }
}

// Usage:
try {
  validateEmployeeData(data);
} catch (err) {
  if (err instanceof ValidationError) {
    // Handle validation error
  }
}
```

### 7. Component Testing Pattern

**Create testable component structure**

```typescript
// src/components/__tests__/EmployeeCard.test.tsx
import { render, screen } from "@testing-library/react-native";
import EmployeeCard from "../EmployeeCard";

describe("EmployeeCard", () => {
  it("should render employee name", () => {
    const employee = { id: "1", name: "John" };
    render(<EmployeeCard employee={employee} />);
    expect(screen.getByText("John")).toBeTruthy();
  });
});
```

---

## 📋 Refactoring Checklist

### Phase 15A: Service Layer (2 hours)

- [ ] Create `src/services/auth/` directory structure
- [ ] Create `src/services/hr/` directory structure
- [ ] Create service index files (exports)
- [ ] Update all imports to use new structure
- [ ] Create `src/services/index.ts` main export

### Phase 15B: Hooks Layer (1.5 hours)

- [ ] Create `src/hooks/useEmployees.ts`
- [ ] Create `src/hooks/useAttendance.ts`
- [ ] Create `src/hooks/useLeaves.ts`
- [ ] Create `src/hooks/usePayroll.ts`
- [ ] Create `src/hooks/index.ts` exports

### Phase 15C: Components (1.5 hours)

- [ ] Create patterns directory
- [ ] Create `LoadingList` component
- [ ] Create `DataCard` component
- [ ] Create `FormWrapper` component
- [ ] Document pattern usage

### Phase 15D: Types (1 hour)

- [ ] Move common types to `common.types.ts`
- [ ] Create generic types
- [ ] Create API response types
- [ ] Add comprehensive JSDoc comments

### Phase 15E: Error Handling (1 hour)

- [ ] Create custom error classes
- [ ] Update all error handling
- [ ] Add error logging service
- [ ] Create error recovery patterns

**Total Time**: ~7 hours

---

## 🚀 Implementation Order

1. **Week 1**: Service layer consolidation
2. **Week 2**: Custom hooks creation
3. **Week 3**: Component pattern library
4. **Week 4**: Type safety & error handling

---

## 📊 Before vs After

### Before

```typescript
// Components directly import services
import { attendanceQueries } from "@/src/services/appwriteClient";
import { attendanceService } from "@/src/services/attendance.service";
// Mixed concerns, hard to test
```

### After

```typescript
// Use custom hooks
import { useAttendance } from "@/src/hooks";
// Or use services from organized structure
import { AttendanceService } from "@/src/services/hr";
// Clean, testable, organized
```

---

## ✅ Quality Metrics

**Before Phase 15**:

- Component reusability: 60%
- Code duplication: 15%
- Type coverage: 90%
- Test-friendliness: 70%

**After Phase 15**:

- Component reusability: 85%
- Code duplication: <5%
- Type coverage: 95%+
- Test-friendliness: 95%

---

## 📝 Documentation Updates

After Phase 15, update:

- [ ] DEVELOPER_GUIDE.md with new patterns
- [ ] Component library documentation
- [ ] Service layer documentation
- [ ] Testing guide

---

## 🔄 Regression Testing Required

After refactoring:

1. Test all screens still load
2. Test all services work correctly
3. Verify offline functionality
4. Check biometric auth
5. Verify notifications
6. Test AI insights
7. Check payslip generation
8. Verify RBAC system

---

## 🎯 Success Criteria

- ✅ All tests pass
- ✅ No deprecated warnings
- ✅ Zero console errors
- ✅ Type checking passes strict mode
- ✅ Performance metrics maintained
- ✅ Code coverage >80%

---

## Links & Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Best Practices](https://reactnative.dev/docs/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Next Phase**: Phase 16 - Testing & Jest Setup

Generated: March 31, 2026 | HRMate v1.0.0 Architecture Plan
