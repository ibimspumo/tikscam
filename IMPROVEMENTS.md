# TikScam - Future Improvements & Recommendations

**Created:** 2025-11-17
**Status:** Roadmap for future refactoring

---

## 📋 Table of Contents
1. [Component Organization](#component-organization)
2. [Type System Improvements](#type-system-improvements)
3. [Performance Optimizations](#performance-optimizations)
4. [Developer Experience](#developer-experience)
5. [Architecture Improvements](#architecture-improvements)

---

## 🗂️ Component Organization

### Current State
- **21 widgets** in flat `components/` directory
- **6 charts** mixed with widgets
- **2 layout components** (StreamTabs, StreamMonitor)
- **1 dialog** (AddStreamDialog)
- Works well but can be hard to navigate

### Recommended Structure (When >30 Components)

```
components/
├── widgets/              # 21 analytics widgets
│   ├── stats/           # Real-time stats (6 widgets)
│   │   ├── StreamInfoWidget.tsx
│   │   ├── LikesPerSecondWidget.tsx
│   │   ├── GiftsWidget.tsx
│   │   ├── ActivityWidget.tsx
│   │   ├── ViewerTrendWidget.tsx
│   │   └── TopUsersWidget.tsx
│   │
│   ├── feeds/           # Live feeds (3 widgets)
│   │   ├── ChatWidget.tsx
│   │   ├── GiftsFeedWidget.tsx
│   │   └── GiftListWidget.tsx
│   │
│   └── DebugWidget.tsx
│
├── charts/              # 6 chart components
│   ├── LikesHistoryChart.tsx
│   ├── ViewerHistoryChart.tsx
│   ├── FollowerHistoryChart.tsx
│   ├── DiamondHistoryChart.tsx
│   ├── EngagementRateChart.tsx
│   └── CombinedTimelineChart.tsx
│
├── layout/              # Layout components
│   ├── StreamTabs.tsx
│   ├── StreamMonitor.tsx
│   └── StatsCard.tsx
│
├── dialogs/             # Modal dialogs
│   └── AddStreamDialog.tsx
│
└── ui/                  # ShadCN primitives
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── tabs.tsx
```

### Benefits
- ✅ Easier to find specific components
- ✅ Better IDE autocomplete
- ✅ Clear separation of concerns
- ✅ Scales to 100+ components

### Implementation Steps
1. Create new subdirectories in `components/`
2. Move files to new locations
3. Update all imports (use VS Code refactoring)
4. Update `components/widgets.ts` barrel export
5. Test build
6. Update CLAUDE.md

**Estimated Time:** 2-3 hours
**Risk Level:** Medium (many import changes)

---

## 📐 Type System Improvements

### 1. Shared Types File

**Problem:** Types like `StreamStats`, `ChatMessage`, `Gift` are duplicated across files.

**Solution:** Create `types/stream.ts`

```typescript
// types/stream.ts
export interface ChatMessage {
  user: string;
  message: string;
  timestamp: number;
  avatar?: string;
}

export interface Gift {
  user: string;
  gift: string;
  count: number;
  timestamp: number;
  avatar?: string;
  diamondCount?: number;
  giftIcon?: string;
  giftImage?: string;
}

export interface StreamStats {
  viewerCount: number;
  totalLikes: number;
  streamTotalLikes: number;
  // ... all other stats
}

export interface RoomInfo {
  id?: string;
  title?: string;
  owner?: UserProfile;
  viewerCount?: number;
  likeCount?: number;
}

// ... etc
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easier refactoring
- ✅ Better type safety

---

### 2. Strict Widget Props Interface

**Current:** Each widget has custom prop interfaces
**Improvement:** Standardize common patterns

```typescript
// types/widgets.ts
export interface BaseWidgetProps {
  className?: string;
}

export interface DataWidgetProps<T> extends BaseWidgetProps {
  data: T;
  loading?: boolean;
  error?: string | null;
}

// Usage:
export interface TopUsersWidgetProps extends DataWidgetProps<Map<string, UserStats>> {
  // Widget-specific props
}
```

---

## ⚡ Performance Optimizations

### 1. Virtual Scrolling for Long Lists

**Components to optimize:**
- `ChatWidget.tsx` (50+ messages)
- `GiftListWidget.tsx` (100+ gifts)
- `TopUsersWidget.tsx` (10+ users per tab)

**Library:** `react-virtual` or `@tanstack/react-virtual`

**Expected Impact:**
- 📉 -50% render time for large lists
- 📉 -30% memory usage

---

### 2. Web Workers for Heavy Calculations

**Candidates:**
- Likes/second calculations in `useTikTokLive.ts`
- Engagement rate calculations
- Historical data aggregation

**Expected Impact:**
- 📉 Main thread stays responsive
- ⚡ Smoother UI during heavy data processing

---

### 3. IndexedDB for Historical Data Persistence

**Current:** All data lost on refresh
**Improvement:** Persist last 1 hour of data

**Benefits:**
- ✅ Resume monitoring after refresh
- ✅ Analyze historical patterns
- ✅ Better UX

**Library:** `idb` (IndexedDB wrapper)

---

## 🛠️ Developer Experience

### 1. Storybook Integration

**Why:** Develop and test widgets in isolation

**Setup:**
```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
```

**Stories Example:**
```typescript
// components/widgets/StreamInfoWidget.stories.tsx
export default {
  title: 'Widgets/StreamInfo',
  component: StreamInfoWidget,
};

export const Default = {
  args: {
    roomInfo: { /* mock data */ },
    username: 'testuser',
  },
};
```

**Benefits:**
- ✅ Faster development
- ✅ Visual regression testing
- ✅ Component documentation

---

### 2. ESLint + Prettier Auto-Fix on Save

**Current:** No code formatting rules enforced
**Improvement:** Add consistent formatting

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

---

### 3. Testing Setup

**Current:** No tests
**Recommendation:** Add critical path tests

**Priority:**
1. **Unit Tests:** `useTikTokLive.ts` calculations
2. **Integration Tests:** SSE connection handling
3. **Component Tests:** Key widgets render correctly

**Tools:**
- Vitest (faster than Jest)
- React Testing Library
- MSW (Mock Service Worker) for API mocking

---

## 🏗️ Architecture Improvements

### 1. Zustand State Management (Alternative to Context)

**Current:** `StreamManagerContext` + individual hooks
**Alternative:** Zustand for global state

```typescript
// stores/streamStore.ts
import create from 'zustand';

interface StreamStore {
  streams: Map<string, StreamData>;
  activeStreamId: string | null;
  addStream: (id: string, data: StreamData) => void;
  removeStream: (id: string) => void;
  setActiveStream: (id: string) => void;
}

export const useStreamStore = create<StreamStore>((set) => ({
  streams: new Map(),
  activeStreamId: null,
  addStream: (id, data) => set((state) => ({
    streams: new Map(state.streams).set(id, data)
  })),
  // ... etc
}));
```

**Benefits:**
- ✅ Less boilerplate than Context
- ✅ Better DevTools
- ✅ Easier testing

---

### 2. React Query for Server State

**Current:** Manual SSE + state management
**Alternative:** React Query for better caching/refetching

**Benefits:**
- ✅ Automatic cache invalidation
- ✅ Background refetching
- ✅ Better error handling

---

### 3. Modular API Layer

**Current:** API routes tightly coupled to tiktok-live-connector
**Improvement:** Abstract connection layer

```typescript
// lib/connections/types.ts
interface StreamConnection {
  connect(username: string): Promise<void>;
  disconnect(): void;
  on(event: string, handler: Function): void;
}

// lib/connections/tiktok-direct.ts
class TikTokDirectConnection implements StreamConnection { /* ... */ }

// lib/connections/eulerstream.ts
class EulerStreamConnection implements StreamConnection { /* ... */ }

// Easy to swap or add new providers
```

---

## 🚀 Feature Ideas

### 1. Stream Recording & Replay

- Save stream data to JSON
- Replay historical streams
- Export analytics as PDF/CSV

### 2. Multi-Stream Comparison

- Side-by-side view of 2+ streams
- Compare metrics in real-time
- Detect raids/botting patterns

### 3. Alert System

- Notify on high engagement spikes
- Detect potential scam indicators
- Custom threshold alerts

### 4. Browser Extension

- Inject overlay on TikTok website
- Real-time scam detection warnings
- One-click monitoring

---

## 📊 Metrics to Track

### Code Quality
- [ ] Code coverage >70%
- [ ] No TypeScript `any` types
- [ ] ESLint errors = 0

### Performance
- [ ] Lighthouse score >90
- [ ] Time to Interactive <2s
- [ ] Cumulative Layout Shift <0.1

### Developer Experience
- [ ] Build time <30s
- [ ] Hot reload <1s
- [ ] All components in Storybook

---

## 🗓️ Prioritization

### High Priority (Next 2 weeks)
- ✅ **Completed:** Code cleanup (Option A)
- ✅ **Completed:** Fix remaining TypeScript `any` types (6 eliminated in useTikTokLive)
- ✅ **Completed:** Add ESLint rules
- ✅ **Completed:** Create shared types file
- ✅ **Completed:** Component reorganization (widgets/, charts/, layout/, dialogs/)
- ✅ **Completed:** Error boundaries for critical widgets

### Medium Priority (Next month)
- ✅ **Completed:** Reorganize components (Option B)
- [ ] Add unit tests for core logic
- [ ] Set up Storybook
- [ ] Virtual scrolling for ChatWidget and GiftListWidget
- [ ] Accessibility improvements (ARIA labels)

### Low Priority (Nice to have)
- [ ] Zustand migration
- [ ] Virtual scrolling
- [ ] IndexedDB persistence
- [ ] Stream recording feature

---

## 🔧 Technical Debt

### Known Issues
1. ✅ **Type Safety:** ~~Several `any` types in event handlers~~ **FIXED** (all `any` types eliminated!)
2. ✅ **Error Boundaries:** ~~No error boundaries for widgets~~ **FIXED**
3. ✅ **Accessibility:** ~~Missing ARIA labels on interactive elements~~ **FIXED** (added to dialogs, buttons, links)
4. **Mobile UX:** Some widgets not optimized for small screens
5. ✅ **Memory Leaks:** ~~EventSource connections may not cleanup on hot reload~~ **FIXED** (added reconnectTimeout cleanup)

### Impact Assessment
| Issue | Severity | Effort | Priority | Status |
|-------|----------|--------|----------|--------|
| Type Safety | Medium | Low | High | ✅ **FIXED** (v0.2.1) |
| Error Boundaries | High | Low | High | ✅ **FIXED** (v0.2.0) |
| Accessibility | Medium | Medium | Medium | ✅ **FIXED** (v0.2.1) |
| Mobile UX | Low | Medium | Low | ⚠️ Pending |
| Memory Leaks | High | Low | High | ✅ **FIXED** (v0.2.1) |

---

## 📚 Learning Resources

- [React Performance Best Practices](https://react.dev/learn/render-and-commit)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Storybook for React](https://storybook.js.org/docs/react/get-started/introduction)

---

---

## 🎉 Recent Accomplishments

### Version 0.2.1 (2025-11-17)
1. ✅ **Type Safety 100%** - Eliminated ALL remaining `any` types (11 in API route)
   - Changed error handlers from `err: any` to proper `instanceof Error` checks
   - Changed `data: any` to `data: unknown` in sendEvent function
   - Zero `any` types across entire codebase
2. ✅ **Accessibility (ARIA)** - Added ARIA labels to all interactive elements
   - Dialog roles and aria-modal attributes
   - Button aria-labels for screen readers
   - Proper id linking for labelledby/describedby
3. ✅ **Memory Leak Fix** - Fixed EventSource cleanup
   - Added reconnectTimeout cleanup in disconnect()
   - Added cleanup in useEffect unmount
   - Prevents timer leaks on hot reload

### Version 0.2.0 (2025-11-17)
1. ✅ **Component Organization** - Reorganized into widgets/, charts/, layout/, dialogs/
2. ✅ **Shared Type System** - Created types/stream.ts and types/widgets.ts
3. ✅ **Type Safety** - Eliminated 6 `any` types from useTikTokLive.ts
4. ✅ **Error Boundaries** - Added WidgetErrorBoundary for critical widgets
5. ✅ **Code Quality** - ESLint + Prettier configuration
6. ✅ **Documentation** - Updated README to modern GitHub standards

**Total Lines Changed:** ~2,000 removed (cleanup) + ~400 added (quality code)
**Build Status:** ✅ All builds successful, no breaking changes
**Bundle Size:** Unchanged at 137 kB

---

**Last Updated:** 2025-11-17
**Version:** 0.2.1
**Maintainer:** @timocorvinus
