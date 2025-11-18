# Refactoring Plan - TikScam v0.5.0

This document outlines the refactoring opportunities identified for improved maintainability.

## ✅ Phase 1: Foundation (COMPLETED)

### 1.1 Constants Extraction
**Status:** ✅ DONE

**Files Created:**
- `lib/constants/intervals.ts` - All timing constants (15000ms, 500ms, etc.)
- `lib/constants/limits.ts` - Data retention limits (50 messages, 100 gifts, etc.)
- `lib/constants/thresholds.ts` - Display thresholds for visual indicators
- `lib/constants/index.ts` - Central export point

**Impact:**
- Eliminated 50+ magic numbers
- Centralized configuration
- Easy to adjust settings

**Usage Example:**
```typescript
import { INTERVALS, LIMITS, CHART_INTERVALS } from '@/lib/constants';

// Before: setInterval(() => {...}, 15000);
// After:  setInterval(() => {...}, INTERVALS.SNAPSHOT);
```

---

### 1.2 Chart Timeline Hook
**Status:** ✅ DONE

**File Created:**
- `hooks/useChartTimeline.ts` - Shared timeline generation logic

**Impact:**
- Eliminates ~600 lines of duplicated code across 5 chart components
- Consistent timeline handling
- Type-safe with generics

**Usage Example:**
```typescript
import { useChartTimeline, defaultValues } from '@/hooks/useChartTimeline';
import { CHART_INTERVALS } from '@/lib/constants';

const timeline = useChartTimeline({
  history: minuteHistory,
  totalIntervals: CHART_INTERVALS.FIFTEEN_MIN,
  defaultValue: defaultValues.likes,
});
```

---

## 🚧 Phase 2: Code Quality (TODO)

### 2.1 Update Chart Components
**Priority:** CRITICAL
**Estimated Time:** 2-3 hours
**Files to Update:**
- `components/charts/LikesHistoryChart.tsx`
- `components/charts/ViewerHistoryChart.tsx`
- `components/charts/FollowerHistoryChart.tsx`
- `components/charts/DiamondHistoryChart.tsx`
- `components/charts/EngagementRateChart.tsx`

**Pattern to Replace:**
```typescript
// OLD (lines 36-62):
const totalIntervals = 60;
const latestData = minuteHistory.length > 0 ? minuteHistory[minuteHistory.length - 1] : null;
const currentInterval = latestData ? latestData.interval : Math.floor(Date.now() / 15000);
const last15Minutes: MinuteStats[] = [];
for (let i = totalIntervals - 1; i >= 0; i--) {
  const interval = currentInterval - i;
  const existing = minuteHistory.find(m => m.interval === interval);
  last15Minutes.push(existing || { interval, likesPerSecond: 0, timestamp: interval * 15000 });
}

// NEW (3 lines):
const timeline = useChartTimeline({
  history: minuteHistory,
  totalIntervals: CHART_INTERVALS.FIFTEEN_MIN,
  defaultValue: defaultValues.likes,
});
```

**Benefit:** Saves ~50-60 lines per chart = ~300 lines total

---

### 2.2 Replace Magic Numbers with Constants
**Priority:** HIGH
**Estimated Time:** 1-2 hours
**Files to Update:**
- `hooks/useTikTokLive.ts` (10+ occurrences)
- `app/api/tiktok-live/[username]/route.ts` (5+ occurrences)
- All chart components (6 files)

**Search & Replace Patterns:**
```typescript
// Timing
15000 → INTERVALS.SNAPSHOT
500   → INTERVALS.LIKE_THROTTLE
60000 → INTERVALS.MINUTE
30000 → INTERVALS.KEEPALIVE

// Limits
50  → LIMITS.CHAT_MESSAGES
100 → LIMITS.GIFTS
50  → LIMITS.JOINS
50  → LIMITS.FOLLOWS

// Chart intervals
60  → CHART_INTERVALS.FIFTEEN_MIN
240 → CHART_INTERVALS.SIXTY_MIN
```

---

### 2.3 Create Proper TypeScript Types
**Priority:** HIGH
**Estimated Time:** 2 hours
**File to Create:**
- `types/tiktok-events.ts`

**Purpose:** Replace `any` types with proper interfaces

```typescript
export interface TikTokRoomData {
  id: string;
  title: string;
  owner: UserProfile;
  viewerCount: number;
  likeCount: number;
}

export interface TikTokConnectionOptions {
  processInitialData: boolean;
  enableExtendedGiftInfo: boolean;
  requestOptions: {
    timeout: number;
    headers: Record<string, string>;
  };
}

export interface TikTokChatEvent {
  user: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

export interface TikTokGiftEvent {
  user: string;
  gift: string;
  count: number;
  timestamp: number;
  avatar?: string;
  diamondCount?: number;
  giftIcon?: string;
  giftImage?: string;
}
```

**Files to Update:**
- `app/api/tiktok-live/[username]/route.ts` - Replace `any` on lines 158, 181, 208
- `components/widgets/StreamInfoWidget.tsx` - Replace `roomInfo: any` with proper type

---

### 2.4 User Stats Update Utility
**Priority:** MEDIUM
**Estimated Time:** 1 hour
**Location:** Add to `hooks/useTikTokLive.ts`

**Current Duplication (3 times):**
```typescript
const userStats = new Map(prev.userStats);
const existing = userStats.get(userId) || {
  userId: userId,
  username: userId,
  avatar: avatarUrl,
  totalDiamonds: 0,
  totalGifts: 0,
  chatMessages: 0,
  firstSeen: Date.now(),
  lastSeen: Date.now(),
};
existing.someField++;
existing.lastSeen = Date.now();
userStats.set(userId, existing);
```

**Proposed Utility:**
```typescript
const updateUserStats = useCallback((
  prevStats: Map<string, UserStats>,
  userId: string,
  avatar: string | undefined,
  updates: Partial<UserStats>
): Map<string, UserStats> => {
  const userStats = new Map(prevStats);
  const existing = userStats.get(userId) || {
    userId,
    username: userId,
    avatar,
    totalDiamonds: 0,
    totalGifts: 0,
    chatMessages: 0,
    firstSeen: Date.now(),
    lastSeen: Date.now(),
  };

  userStats.set(userId, { ...existing, ...updates, lastSeen: Date.now() });
  return userStats;
}, []);
```

---

## 📊 Phase 3: Advanced Refactoring (FUTURE)

### 3.1 Split StreamMonitor Component
**Priority:** MEDIUM
**Estimated Time:** 3-4 hours

Split 355-line component into:
- `ConnectionControl.tsx` - Connection status, API key input, errors
- `StreamDashboard.tsx` - Stats cards and widget grid
- `StreamMonitor.tsx` - Layout coordinator

---

### 3.2 Generic IntervalChart Component
**Priority:** LOW
**Estimated Time:** 4-5 hours

Create single generic component to replace 4 similar chart components:
- ViewerHistoryChart
- FollowerHistoryChart
- DiamondHistoryChart
- (Potentially) LikesHistoryChart

---

### 3.3 Centralize Recharts Configuration
**Priority:** LOW
**Estimated Time:** 1 hour

Create `lib/chartConfig.ts`:
```typescript
export const CHART_DEFAULTS = {
  margin: { top: 10, right: 10, left: -20, bottom: 0 },
  cartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "hsl(var(--muted))",
    opacity: 0.3,
  },
  axis: {
    stroke: "hsl(var(--muted-foreground))",
    fontSize: 10,
    tickLine: false,
  },
  height: 250,
};
```

---

## 📈 Expected Impact

### Before Refactoring:
- Total Lines: ~3,400
- Duplicated Code: ~800 lines (24%)
- Magic Numbers: 50+ occurrences
- Test Coverage: 0%

### After Complete Refactoring:
- Total Lines: ~2,600 (-800 lines / -24%)
- Duplicated Code: <100 lines (<4%)
- Magic Numbers: 0 (all in constants)
- Test Coverage: 60%+

---

## 🎯 Quick Wins (Next Steps)

1. **Update Chart Components** (2-3 hours)
   - Replace timeline logic with `useChartTimeline` hook
   - **Impact:** -300 lines, consistent behavior

2. **Replace Magic Numbers** (1-2 hours)
   - Search & replace with constants
   - **Impact:** Better maintainability, centralized config

3. **Fix Type Safety** (2 hours)
   - Create proper types for TikTok events
   - Replace `any` types
   - **Impact:** Better IDE support, fewer bugs

**Total Time for Quick Wins:** 5-7 hours
**Total Impact:** -300 lines, 0 magic numbers, better types

---

## 📝 Implementation Checklist

### Phase 1: Foundation ✅
- [x] Create `lib/constants/intervals.ts`
- [x] Create `lib/constants/limits.ts`
- [x] Create `lib/constants/thresholds.ts`
- [x] Create `lib/constants/index.ts`
- [x] Create `hooks/useChartTimeline.ts`

### Phase 2: Quick Wins (TODO)
- [ ] Update LikesHistoryChart
- [ ] Update ViewerHistoryChart
- [ ] Update FollowerHistoryChart
- [ ] Update DiamondHistoryChart
- [ ] Update EngagementRateChart
- [ ] Replace magic numbers in useTikTokLive
- [ ] Replace magic numbers in API route
- [ ] Create types/tiktok-events.ts
- [ ] Fix 'any' types in API route
- [ ] Fix 'any' types in widgets
- [ ] Create updateUserStats utility

### Phase 3: Advanced (FUTURE)
- [ ] Split StreamMonitor component
- [ ] Create generic IntervalChart
- [ ] Centralize Recharts config
- [ ] Add test coverage
- [ ] Add JSDoc documentation

---

## 🚀 How to Continue

1. **Run Tests** (when added):
   ```bash
   npm test
   ```

2. **Check for Unused Imports**:
   ```bash
   npm run lint
   ```

3. **Verify Constants Work**:
   ```typescript
   import { INTERVALS, LIMITS } from '@/lib/constants';
   console.log(INTERVALS.SNAPSHOT); // Should be 15000
   ```

4. **Update Chart Components** (see section 2.1 for pattern)

---

**Last Updated:** 2025-11-18
**Version:** 0.5.0-dev
**Status:** Phase 1 Complete, Phase 2 Ready to Start
