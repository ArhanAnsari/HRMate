# 📱 HRMate Messaging & Notification System - Complete Documentation

## 🎯 Overview

A **production-ready, event-driven messaging system** for HRMate that supports:

- 📲 **Push Notifications** (Expo/APNs/FCM)
- 📧 **Email Notifications** (Appwrite Messaging)
- 💬 **SMS Notifications** (Appwrite Messaging)
- 🤖 **AI-Powered Messages** (Gemini API)
- 📴 **Offline Support** (Local caching & sync)
- 👤 **User Preferences** (Do-not-disturb, quiet hours)

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    EVENT-DRIVEN FLOW                          │
└──────────────────┬───────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  APP EVENT          │
        │  (Leave applied,    │
        │   Salary processed) │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  EVENT SERVICE                   │
        │  - Validates event              │
        │  - Checks preferences           │
        │  - Generates message (AI)       │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────────────────────────────┐
        │  CHANNEL SELECTION (Push/Email/SMS)                 │
        └──────────┬──────────────────────────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  MESSAGING SERVICE               │
        │  - Sends via channels           │
        │  - Handles errors               │
        │  - Logs delivery                │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  APPWRITE & EXPO                │
        │  - Store notification           │
        │  - Send push                    │
        │  - Email/SMS delivery           │
        └──────────┬──────────────────────┘
                   │
        ┌──────────▼──────────────────────┐
        │  DEVICE & USER                   │
        │  - Receive notification         │
        │  - Update UI                    │
        │  - Notification Center          │
        └──────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── services/
│   ├── event.service.ts                    # Event system & routing
│   ├── messaging.service.ts                # Push/Email/SMS sending
│   ├── notification-preferences.service.ts # User preferences
│   ├── notifications.service.ts            # Device token management
│   ├── offline-support.service.ts          # Offline caching & sync
│   ├── ai.service.ts                       # AI message generation
│   └── notification-integration.examples.ts # Implementation examples
│
├── state/
│   └── notifications.store.ts              # Zustand notification store
│
├── components/
│   └── NotificationCenter.tsx              # Notification UI component
│
└── config/
    └── env.ts                              # Collection IDs & config
```

---

## 🔧 Setup Instructions

### 1. Environment Configuration

Add to your `.env.local`:

```bash
# Appwrite
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=69ca44f20000ebf91141
EXPO_PUBLIC_APPWRITE_DATABASE_ID=69ca4ebb0005b6c43a63

# Collections (Already configured)
EXPO_PUBLIC_NOTIFICATIONS_COLLECTION=notifications_collection
EXPO_PUBLIC_DEVICE_TOKENS_COLLECTION=device_tokens_collection
EXPO_PUBLIC_NOTIFICATION_PREFERENCES_COLLECTION=notification_preferences_collection
EXPO_PUBLIC_NOTIFICATION_LOGS_COLLECTION=notification_logs_collection

# Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 2. Initialize on App Startup

```typescript
// In your main App.tsx or auth flow
import { initializeNotificationSystem } from "@/src/services/notification-integration.examples";

export default function App() {
  useEffect(() => {
    if (userId) {
      initializeNotificationSystem(userId);
    }
  }, [userId]);

  return (/* ... */);
}
```

### 3. Verify Database Collections

All required collections are in `appwrite.json`:

- ✅ `notifications_collection` - Stores sent notifications
- ✅ `device_tokens_collection` - Stores device tokens
- ✅ `notification_preferences_collection` - User preferences
- ✅ `notification_logs_collection` - Delivery logs

---

## 🚀 Usage Examples

### Example 1: Send Leave Approval Notification

```typescript
import { eventService, EventType } from "@/src/services/event.service";

await eventService.triggerEvent({
  userId: "employee_id",
  companyId: "company_id",
  eventType: EventType.LEAVE_APPROVED,
  data: {
    leaveType: "Casual Leave",
    startDate: "2024-04-01",
    noOfDays: 3,
  },
});

// Result:
// ✅ Notification stored in DB
// 📲 Push notification sent
// 📧 Email sent
// 💾 Offline cached if needed
```

### Example 2: Process Monthly Salaries

```typescript
import { processMonthlySalary } from "@/src/services/notification-integration.examples";

await processMonthlySalary(companyId, [
  { id: "emp1", name: "John", salary: 50000 },
  { id: "emp2", name: "Jane", salary: 60000 },
]);

// Each employee receives:
// ✅ Push + Email notification
// 💬 AI-generated personalized message
// 📊 Salary details included
```

### Example 3: Sync Notifications in Component

```typescript
import { useNotificationStore } from "@/src/state/notifications.store";

export function NotificationList({ userId }: { userId: string }) {
  const {
    loadNotificationsFromServer,
    filteredNotifications,
    unreadCount,
  } = useNotificationStore();

  useEffect(() => {
    loadNotificationsFromServer(userId);
  }, [userId]);

  return (
    <div>
      <h2>Notifications ({unreadCount} unread)</h2>
      {filteredNotifications.map((notif) => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </div>
  );
}
```

### Example 4: Manage User Preferences

```typescript
import { notificationPreferencesService } from "@/src/services/notification-preferences.service";

// Get current preferences
const prefs = await notificationPreferencesService.getPreferences(userId);

// Toggle push notifications
await notificationPreferencesService.togglePushNotifications(userId, false);

// Set quiet hours (9 PM - 8 AM)
await notificationPreferencesService.setQuietHours(userId, "21:00", "08:00");

// Check if notification should be sent
const shouldSend = notificationPreferencesService.shouldSendNotification(
  prefs,
  "push",
  "LEAVE_APPROVED",
);
```

### Example 5: Offline Support

```typescript
import { offlineSupportService } from "@/src/services/offline-support.service";

// Initialize offline support
await offlineSupportService.initialize();

// When offline:
// ✅ Notifications are cached locally
// 📱 Shown in Notification Center
// 🔄 Auto-synced when online

// Manual sync
const { synced, failed } = await offlineSupportService.syncOfflineData();
console.log(`Synced: ${synced}, Failed: ${failed}`);

// Get cache stats
const stats = await offlineSupportService.getCacheStats();
console.log(`Cached: ${stats.totalCached}, Size: ${stats.cacheSize}`);
```

---

## 🎯 Event Types & Channels

### Supported Events

| Event             | Channels     | Priority     | Use Case                        |
| ----------------- | ------------ | ------------ | ------------------------------- |
| LEAVE_APPLIED     | Push         | Normal       | When employee applies for leave |
| LEAVE_APPROVED    | Push + Email | High         | When leave is approved          |
| LEAVE_REJECTED    | Push + Email | High         | When leave is rejected          |
| SALARY_PROCESSED  | Push + Email | High         | Monthly salary processed        |
| ATTENDANCE_MARKED | Push         | Normal       | Attendance recorded             |
| EMPLOYEE_ADDED    | Push + Email | Normal       | New employee onboarded          |
| OTP_LOGIN         | SMS + Email  | **CRITICAL** | Login OTP (always sent)         |
| HR_ANNOUNCEMENT   | Push + Email | Normal       | HR announcements                |
| PAYSLIP_GENERATED | Push + Email | High         | Payslip ready                   |
| SHIFT_ASSIGNED    | Push + Email | Normal       | Shift assignment                |

### Channel Behavior

- **Push**: Sent to device via Expo/FCM/APNs
- **Email**: Sent to email address
- **SMS**: Short message (max 160 chars) sent to phone

---

## 🔒 Security & Best Practices

### 1. Validate User IDs

```typescript
// ✅ DO: Always validate
const user = await getUserFromDB(userId);
if (!user) throw new Error("User not found");

// ❌ DON'T: Send to unvalidated IDs
await eventService.triggerEvent({...}); // Bad!
```

### 2. Respect User Preferences

```typescript
// ✅ Check preferences before sending
const prefs = await notificationPreferencesService.getPreferences(userId);
if (!prefs.emailEnabled) return; // Don't send

// ❌ Ignore preferences
// Just send without checking
```

### 3. Rate Limiting

```typescript
// Implement per-user rate limiting
const lastSentKey = `last_notif_${userId}`;
const lastSent = await redis.get(lastSentKey);
if (Date.now() - lastSent < 5000) return; // Too soon
```

### 4. Never Send Sensitive Data

```typescript
// ✅ Safe
await eventService.triggerEvent({
  data: { leaveType: "Sick Leave" },
});

// ❌ NEVER send
await eventService.triggerEvent({
  data: { password: "secret", ssn: "123-45-6789" },
});
```

### 5. Error Handling

```typescript
try {
  await eventService.triggerEvent({...});
} catch (error) {
  console.error("Notification failed:", error);
  // Log error, retry later, notify admin
}
```

---

## 📊 Monitoring & Debugging

### Enable Debug Logging

```typescript
// In console
localStorage.setItem("DEBUG_NOTIFICATIONS", "true");

// Now you'll see detailed logs
// 📢 Event triggered: LEAVE_APPROVED for user abc123
// 🔑 Device token obtained: ExponentPushToken[...]
// 📤 Sending push notification to user abc123
// ✅ Push notification sent successfully
// 📧 Email sent to john@example.com
```

### Check Delivery Status

```typescript
import { messagingService } from "@/src/services/messaging.service";

const status = await messagingService.getDeliveryStatus(notificationId);
// [
//   { channel: "push", status: "sent" },
//   { channel: "email", status: "sent" },
//   { channel: "sms", status: "failed", error: "Invalid number" }
// ]
```

### Retry Failed Notifications

```typescript
import { eventService } from "@/src/services/event.service";

await eventService.retryFailedNotification(notificationId);
// Re-sends notification with same data
```

### Monitor Cache Health

```typescript
const stats = await offlineSupportService.getCacheStats();
console.log(`
  Total: ${stats.totalCached}
  Synced: ${stats.syncedCount}
  Unsynced: ${stats.unsyncedCount}
  Size: ${stats.cacheSize}
`);
```

---

## 🎨 UI Components

### Notification Center

```tsx
import { NotificationCenter } from "@/src/components/NotificationCenter";

// In your modal/screen
<NotificationCenter
  userId={userId}
  onClose={() => setShowNotifications(false)}
/>;
```

### Features

- 📋 View all notifications
- 🔍 Filter by type/channel/read status
- ✅ Mark as read/unread
- 🗑️ Delete notifications
- ⚙️ User preferences
- 🚫 Quiet hours management
- 📊 Priority indicators
- ⏱️ Time formatting (e.g., "2min ago")

---

## 🔄 Data Flow Examples

### Complete Leave Approval Flow

```
1. HR approves leave in Leave Management screen
   ↓
2. Calls: approveLeave(userId, leaveData)
   ↓
3. Update leave status in DB
   ↓
4. Trigger event: EventType.LEAVE_APPROVED
   ↓
5. Event Service:
   - Gets user preferences
   - Generates AI message
   - Creates notification record
   ↓
6. Messaging Service:
   - Checks if Push enabled → Send push
   - Checks if Email enabled → Send email
   ↓
7. Appwrite:
   - Store notification
   - Send push via Expo/FCM
   - Queue email
   ↓
8. User receives:
   - Push notification on device
   - Email in inbox
   - Notification in app
   ↓
9. Notification Center:
   - Lists all notifications
   - Shows as read/unread
   - Allows deletion
```

---

## 🐛 Troubleshooting

### Push Notifications Not Working

```typescript
// 1. Check device registration
const deviceToken = await NotificationsService.getDeviceToken();
if (!deviceToken) console.warn("Physical device required");

// 2. Check permissions
const hasPermission = await NotificationsService.requestPermissions();
if (!hasPermission) console.error("Permissions denied");

// 3. Check token in DB
const tokens = await databases.listDocuments(
  ...,
  [Query.equal("user_id", userId)]
);
console.log("Stored tokens:", tokens.length);
```

### Notifications Not Showing in Center

```typescript
// 1. Check if synced from server
const { isLoading } = useNotificationStore();
console.log("Loading:", isLoading);

// 2. Check filter
const { currentFilter } = useNotificationStore();
console.log("Current filter:", currentFilter);

// 3. Check local cache
const cached = await offlineSupportService.getCachedNotifications();
console.log("Cached:", cached.length);
```

### Offline Sync Not Working

```typescript
// 1. Check connectivity
const isOnline = await offlineSupportService.isOnline();
console.log("Online:", isOnline);

// 2. Check cache size
const stats = await offlineSupportService.getCacheStats();
console.log("Stats:", stats);

// 3. Manual retry
const result = await offlineSupportService.syncOfflineData();
console.log("Sync result:", result);
```

---

## 📈 Performance Tips

### 1. Batch Notifications

```typescript
// ❌ Don't - 100 separate calls
for (const emp of employees) {
  await eventService.triggerEvent({...});
}

// ✅ Do - Batch processing
const results = await Promise.all(
  employees.map(emp => eventService.triggerEvent({...}))
);
```

### 2. Debounce Preference Updates

```typescript
import debounce from "lodash/debounce";

const updatePref = debounce(
  async (userId, prefs) => {
    await notificationPreferencesService.updatePreferences(userId, prefs);
  },
  1000, // Wait 1 second before updating
);
```

### 3. Lazy Load Notification History

```typescript
// Only load when needed
const loadMore = async () => {
  const moreNotifications = await eventService.getNotificationHistory(
    userId,
    50, // limit
    offset, // pagination
  );
};
```

### 4. Clear Old Cache

```typescript
// Cleanup old cached notifications
const cache = await offlineSupportService.getCachedNotifications();
const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const recent = cache.filter((n) => n.timestamp > oneWeekAgo);
```

---

## 🚀 Deployment Checklist

- [ ] Add all environment variables to `.env`
- [ ] Test with physical device (for push notifications)
- [ ] Verify all database collections exist in Appwrite
- [ ] Test offline caching and sync
- [ ] Test all event types end-to-end
- [ ] Set up monitoring/alerts
- [ ] Test error scenarios (network down, invalid data, etc.)
- [ ] Performance test with bulk notifications
- [ ] Set up metrics collection
- [ ] Document any custom implementations
- [ ] Test on both iOS and Android
- [ ] Set up CI/CD with notification tests

---

## 📞 Support & Resources

- **Appwrite Docs**: https://appwrite.io/docs
- **Expo Notifications**: https://docs.expo.dev/versions/latest/sdk/notifications/
- **Gemini API**: https://ai.google.dev/docs
- **NetInfo**: https://github.com/react-native-netinfo/react-native-netinfo

---

**Last Updated**: 2024-03-31  
**Version**: 1.0.0  
**Status**: Production Ready ✅
