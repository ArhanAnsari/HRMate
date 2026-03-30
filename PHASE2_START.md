# HRMate - Phase 2 Quick Start Guide

## What's Ready to Work On Right Now

You have everything you need to build employee management. Here's exactly how:

---

## 1. Connect to Appwrite (prerequisite)

Create these collections in Appwrite Console:

```
Database: default (or create new)

Collection: users_collection
Collection: employees_collection
Collection: companies_collection
(others can be created as needed)
```

Update `.env`:
```
EXPO_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1  (or your URL)
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
```

---

## 2. Employee List Screen - Pattern to Follow

The service and store are ALREADY CREATED:
- `src/services/employees.service.ts` - ✅ Has CRUD + search
- `src/state/employee.store.ts` - ✅ Has actions and state

To connect employee list to real data:

### In `app/(dashboard)/employees.tsx`:

```typescript
useEffect(() => {
  if (user?.companyId) {
    // Uncomment this line:
    fetchEmployees(user.companyId);  // From useEmployeeStore
  }
}, [user?.companyId]);
```

### Data will then show from store:
```typescript
const displayEmployees = employees.length > 0 ? employees : demoEmployees;
```

---

## 3. Add Employee Form - Use This Template

Create: `app/(dashboard)/employees/add.tsx`

```typescript
import { useState } from 'react';
import { Button, Input, Container } from '../../../src/components/ui';
import { useEmployeeStore } from '../../../src/state/employee.store';
import { useAuthStore } from '../../../src/state/auth.store';
import { useUIStore } from '../../../src/state/ui.store';

export default function AddEmployeeScreen() {
  const { user } = useAuthStore();
  const { createEmployee, isLoading } = useEmployeeStore();
  const { showToast } = useUIStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    // ... other fields
  });

  const handleCreate = async () => {
    try {
      await createEmployee(user!.companyId, form);
      showToast('Employee created!', 'success');
      router.back();
    } catch (err) {
      showToast('Failed to create', 'error');
    }
  };

  return (
    <Container>
      <Input
        label="First Name"
        value={form.firstName}
        onChangeText={(v) => setForm({...form, firstName: v})}
      />
      {/* ... more fields */}
      <Button
        title="Create"
        onPress={handleCreate}
        isLoading={isLoading}
      />
    </Container>
  );
}
```

**Key Points:**
- Service does API calls
- Store manages state
- Component displays UI
- All error handling built-in

---

## 4. Replicate for Other Features

Each feature follows the SAME pattern:

### Attendance:
```
src/services/attendance.service.ts    (CRUD operations)
src/state/attendance.store.ts         (State management)
app/(dashboard)/attendance.tsx        (Component)
```

### Leaves:
```
src/services/leaves.service.ts
src/state/leaves.store.ts
app/(dashboard)/leaves.tsx
```

### Payroll:
```
src/services/payroll.service.ts
src/state/payroll.store.ts
app/(dashboard)/payroll.tsx
```

---

## 5. What You Can Do Immediately

1. ✅ Copy employee service pattern → Create `attendance.service.ts`
2. ✅ Copy employee store pattern → Create `attendance.store.ts`
3. ✅ Copy employee form pattern → Create attendance form
4. ✅ Use same components (Button, Input, Card, etc.)
5. ✅ Hook into same error handling and toast system

---

## 6. Files You Don't Need to Modify

✅ Existing components are good as-is
✅ Colors and spacing are final
✅ Routes are correct
✅ Auth routing works
✅ Dark mode is automatic

---

## 7. Quick Feature Implementations (Order)

**Phase 2A - Employee Management** (2-3 hours)
- [ ] Connect to Appwrite employees_collection
- [ ] Implement full employee list
- [ ] Add/edit forms
- [ ] Delete functionality
- [ ] Search/filter

**Phase 2B - Attendance** (2 hours)
- [ ] Check-in/out buttons
- [ ] Record to attendance_collection
- [ ] Daily summary

**Phase 2C - Leaves** (2 hours)
- [ ] Leave request form
- [ ] Approval workflow
- [ ] Balance tracking

**Phase 3 - Payroll** (3 hours)
- [ ] Salary structure setup
- [ ] Calculate salary
- [ ] Generate PDF

**Phase 4 - AI** (2 hours)
- [ ] Set up Gemini API key
- [ ] Connect to chat service
- [ ] Build chat interface

---

## 8. Testing Your Work

**Test locally:**
```bash
npm start --web
```

**Test on mobile:**
```bash
npm start --android
npm start --ios
```

All components respond to:
- Dark mode
- Screen size changes
- Loading states
- Error messages

---

## 9. Pro Tips

💡 **Use TypeScript** - All types are defined in `src/types/`

💡 **Follow the Pattern** - Service → Store → Component (every time)

💡 **Use Constants** - `Routes`, `Colors`, `Spacing` are your friends

💡 **Toast for Feedback** - `showToast('message', 'success')`

💡 **Error Handling** - Already built into services and stores

---

## 10. You're Ready!

The foundation is SOLID. Just implement features using the established pattern.

Each new feature is literally:
1. Create service (copy employee service)
2. Create store (copy employee store)
3. Create UI (use existing components)
4. Connect them
5. Done!

**Get started with employees, then everything else is the same pattern.**

Good luck! 🚀

