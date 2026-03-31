# 🚀 Messaging System - Quick Start Guide

## 5-Minute Setup

### Step 1: Verify Database (Already Done ✅)

All collections are configured in `appwrite.json`:

- ✅ `notifications_collection`
- ✅ `device_tokens_collection`
- ✅ `notification_preferences_collection`
- ✅ `notification_logs_collection`

### Step 2: Add to `.env.local`

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

### Step 3: Initialize on App Startup

```typescript
// In your App.tsx
import { initializeNotificationSystem } from "@/src/services/notification-integration.examples";

useEffect(() => {
  if (userId) {
    initializeNotificationSystem(userId);
  }
}, [userId]);
```

### Step 4: Done! 🎉

## Common Tasks

### Send a Notification

```typescript
import { eventService, EventType } from "@/src/services/event.service";

// Leave approved
await eventService.triggerEvent({
  userId: "emp123",
  companyId: "comp456",
  eventType: EventType.LEAVE_APPROVED,
  data: { leaveType: "Casual Leave", startDate: "2024-04-01" },
});

// Salary processed
await eventService.triggerEvent({
  userId: "emp123",
  companyId: "comp456",
  eventType: EventType.SALARY_PROCESSED,
  data: { amount: 50000, month: "March 2024" },
});
```

### Show Notification Center

```typescript
import { NotificationCenter } from "@/src/components/NotificationCenter";

<NotificationCenter userId={userId} onClose={handleClose} />
```

### Get Notifications List

```typescript
import { useNotificationStore } from "@/src/state/notifications.store";

const { notifications, unreadCount, loadNotificationsFromServer } = useNotificationStore();

useEffect(() => {
  loadNotificationsFromServer(userId);
}, [userId]);

return (
  <div>
    <h2>Notifications: {unreadCount} unread</h2>
    {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
  </div>
);
```

### Manage Preferences

```typescript
import { notificationPreferencesService } from "@/src/services/notification-preferences.service";

// Get preferences
const prefs = await notificationPreferencesService.getPreferences(userId);

// Toggle channels
await notificationPreferencesService.togglePushNotifications(userId, false);
await notificationPreferencesService.toggleEmailNotifications(userId, true);

// Set quiet hours
await notificationPreferencesService.setQuietHours(userId, "22:00", "08:00");
```

## File Reference

| File                                  | Purpose                    |
| ------------------------------------- | -------------------------- |
| `event.service.ts`                    | Event routing & triggering |
| `messaging.service.ts`                | Send push/email/SMS        |
| `notification-preferences.service.ts` | User preferences           |
| `notifications.service.ts`            | Device token mgmt          |
| `offline-support.service.ts`          | Offline caching            |
| `ai.service.ts`                       | AI message generation      |
| `notifications.store.ts`              | Zustand state              |
| `NotificationCenter.tsx`              | UI component               |

## Events Reference

```typescript
EventType.LEAVE_APPLIED; // User applies for leave
EventType.LEAVE_APPROVED; // Leave approved by HR
EventType.LEAVE_REJECTED; // Leave rejected
EventType.SALARY_PROCESSED; // Monthly salary processed
EventType.ATTENDANCE_MARKED; // Attendance recorded
EventType.EMPLOYEE_ADDED; // New employee added
EventType.OTP_LOGIN; // Login OTP (CRITICAL - always sends)
EventType.HR_ANNOUNCEMENT; // HR announcement
EventType.PAYSLIP_GENERATED; // Payslip ready
EventType.SHIFT_ASSIGNED; // Shift assigned
```

## Tips

✅ **Always** check user preferences before sending custom notifications  
✅ **Always** validate user IDs  
✅ Keep messages under 200 characters  
✅ Use AI service for dynamic messages  
✅ Test with physical device for push  
✅ Check offline support is working

## Testing

```bash
# Send test notification
npm run test:notifications

# Check cache
npm run debug:cache

# Monitor sync
npm run debug:sync
```

## Common Issues & Fixes

**Push not working?**

- Must use physical device, not emulator
- Check permi permissions granted
- Verify device token registered

**Notifications not showing?**

- Check `loadNotificationsFromServer()` is called
- Verify notifications exist in DB
- Check filters aren't hiding them

**Offline sync failing?**

- Check internet connection
- Verify cache isn't full (>500 items)
- Check sync attempt count (max 3)

## Next Steps

1. ✅ Read full documentation: `MESSAGING_SYSTEM_DOCUMENTATION.md`
2. ✅ Check examples: `notification-integration.examples.ts`
3. ✅ Integrate into your screens
4. ✅ Test end-to-end
5. ✅ Deploy with confidence!

---

**Need Help?** Check `MESSAGING_SYSTEM_DOCUMENTATION.md` for detailed guide.
