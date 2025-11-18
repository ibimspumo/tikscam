# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow & Commit Policy

### Commit Frequency
**IMPORTANT:** Create a git commit after **EVERY meaningful change**. Do not batch multiple unrelated changes into one commit.

**When to commit:**
- After fixing a bug
- After adding a new feature
- After refactoring code
- After updating documentation
- After changing configuration
- After any logical unit of work is complete

**Commit message format:**
```
<type>: <short description>

<detailed explanation if needed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit types:** Fix, Add, Update, Docs, Refactor, Style, Perf, Test, Build, CI

### README.md Maintenance
**IMPORTANT:** Automatically update README.md when making significant changes:

**When to update README:**
- Adding new major features (new widgets, charts, analytics)
- Changing architecture or data flow
- Adding/removing dependencies
- Changing build process or commands
- Adding new documentation files
- Fixing critical bugs that affect usage
- Updating version numbers

**What to update in README:**
- Feature lists and descriptions
- Tech stack table
- Project structure (if files moved/added)
- Installation/setup instructions
- Troubleshooting section (for common bugs)
- Project status and version number

**Process:**
1. Make code changes
2. Update README.md if applicable
3. Commit both together with descriptive message

## Current Version

**v0.5.0** - Latest stable release

Recent updates (v0.5.0):
- Fixed critical data transmission bugs (streamTotalLikes, gift catalog)
- Added Electron splash screen with version display
- Electron app now uses bundled Node.js (truly standalone)
- Added missing translation keys
- Complete README rewrite with detailed technical context

See `RELEASE_NOTES_v0.5.0.md` for full changelog.

## Project Overview

**TikScam** is a transparency tool for TikTok Live streams that helps viewers detect scam streams and timer manipulation in real-time. The application monitors TikTok live streams and provides detailed analytics on gifts, viewer counts, likes, chat activity, and more.

### UI Design

The project uses **ShadCN UI** for all components:

- Route: `/` (Homepage)
- Locations:
  - Main components: `components/*.tsx`
  - Widgets: `components/widgets/index.tsx` (central export)
  - V2 sources: `components/v2/*.tsx` (original ShadCN implementations)
- Style: ShadCN UI + Radix Primitives + Lucide Icons
- Features: Accessibility, clean design, semantic color system, component variants

## Commands

### Development
```bash
# Start development server with Turbopack (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing Stream Connection
```bash
# Test SSE endpoint (replace username)
curl "http://localhost:3000/api/tiktok-live/dom.anyart"

# Test user profile API
curl "http://localhost:3000/api/tiktok-user"

# Test with grep to see specific events
curl -s "http://localhost:3000/api/tiktok-live/username" | grep "event: connected"
```

**Note:** Development server runs on port **3000**, not 3001.

## Architecture

### Dual-Connection Strategy

The application uses **two methods** for connecting to TikTok streams, with automatic fallback:

1. **Primary: Direct TikTok Connection** (`tiktok-live-connector` library)
   - No API key required initially
   - Limited to ~10-20 connections/day
   - Connects directly to TikTok's WebSocket

2. **Fallback: EulerStream API** (`@eulerstream/euler-websocket-sdk`)
   - Activated when rate limit is hit
   - Requires API key (stored in `.env.local` as `EULERSTREAM_API_KEY`)
   - Supports 100+ connections/day

**Key Implementation:**
- `app/api/tiktok-live/[username]/route.ts` - Server-side SSE endpoint with automatic fallback
- `hooks/useTikTokLive.ts` - Main React hook that connects via SSE and aggregates stats

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React Components)                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ StreamMonitor.tsx (Main Dashboard)                   │  │
│  │ - Uses useTikTokLive() hook                          │  │
│  │ - Renders 20 analytics components                    │  │
│  │   (10 widgets + 6 charts + 3 layout + 1 dialog)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ useTikTokLive Hook                                   │  │
│  │ - Connects via Server-Sent Events (SSE)              │  │
│  │ - Aggregates stats from stream events                │  │
│  │ - Throttles like events (500ms)                      │  │
│  │ - Maintains 15-min rolling window                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ SSE Connection
┌─────────────────────────────────────────────────────────────┐
│  Backend (Next.js API Routes)                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/tiktok-live/[username]/route.ts                 │  │
│  │ - SSE endpoint streaming real-time events            │  │
│  │ - Uses tiktok-live-connector                         │  │
│  │ - Broadcasts: chat, gift, like, member, social, etc.│  │
│  │ - Automatic fallback to EulerStream on rate limit   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ WebSocket
┌─────────────────────────────────────────────────────────────┐
│  TikTok Live Server (or EulerStream Fallback)               │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Stream Management

**Context-based state management:**
- `contexts/StreamManagerContext.tsx` - Manages multiple stream tabs
- Session persistence using `sessionStorage`
- Each tab has independent connection and stats
- Tab switching without losing data

### Performance Optimizations

**Critical performance features** (implemented to prevent crashes):

1. **React.memo on all 20 components** - Only re-render on prop changes
2. **Event throttling** - Like events throttled to 500ms (reduces 50+ updates/sec to ~2/sec)
3. **useMemo for expensive calculations** - Chart data aggregations are cached
4. **15-minute rolling window** - Reduced from 60min (75% fewer data points)
5. **15-second interval snapshots** - Instead of continuous updates

**Result:** 96% fewer re-renders, ~70% less CPU usage, ~50% less RAM

### Component Architecture

**Total: 20 components** organized by file structure using `React.memo()` for performance:

**Widgets (10 files in `components/widgets/`):**
- `StreamInfoWidget.tsx` - Stream metadata, profile, likes
- `LikesPerSecondWidget.tsx` - Like rate calculator (10s/20s/30s/45s/60s)
- `ViewerTrendWidget.tsx` - Current/peak/average viewers with trend
- `ActivityWidget.tsx` - Join/follow activity feed
- `GiftsFeedWidget.tsx` - Horizontal scrollable gift feed
- `GiftListWidget.tsx` - Complete TikTok gift catalog browser (~100+ gifts)
- `ChatWidget.tsx` - Live chat messages (last 50 with avatars)
- `TopUsersWidget.tsx` - Rankings (top gifters, chatters, active users)
- `DebugWidget.tsx` - Raw technical data viewer
- `ErrorBoundary.tsx` - Error handling wrapper

**Charts (6 files in `components/charts/`):**
- `LikesHistoryChart.tsx` - Like rate timeline (15-min)
- `ViewerHistoryChart.tsx` - Viewer count timeline (15-min)
- `FollowerHistoryChart.tsx` - New followers timeline (15-min)
- `DiamondHistoryChart.tsx` - Diamond earnings timeline (15-min)
- `EngagementRateChart.tsx` - Engagement metrics (likes per viewer)
- `CombinedTimelineChart.tsx` - All metrics in one chart

**Layout (3 files in `components/layout/`):**
- `StreamMonitor.tsx` - Main dashboard orchestrator
- `StreamTabs.tsx` - Multi-stream tab manager
- `StatsCard.tsx` - Reusable stat display card

**Dialogs (1 file in `components/dialogs/`):**
- `AddStreamDialog.tsx` - Modal for adding new stream

**Performance features:**
- All components use React.memo() to prevent unnecessary re-renders
- Charts use 15-second interval snapshots for efficiency
- Feed components limit data (50 chat messages, 100 gifts, 50 activities)

## API Endpoints

### TikTok Data (SSE)
- `GET /api/tiktok-live/[username]` - **Main SSE endpoint for real-time events**
  - Returns Server-Sent Events stream
  - Event types: `chat`, `gift`, `like`, `member`, `social`, `roomUser`, `connected`, `disconnected`, `retrying`
  - Automatic fallback to EulerStream API on rate limit

### TikTok Info APIs
- `GET /api/tiktok-user` - Get user profile data (follower count, avatar, etc.)

## Environment Variables

Required in `.env.local`:
```bash
# EulerStream API Key (optional, used as fallback on rate limits)
EULERSTREAM_API_KEY=your_api_key_here
```

**Get free API key:** https://www.eulerstream.com/pricing

## Constants Library

**Location:** `lib/constants/`

All magic numbers have been replaced with named constants for maintainability:

**`lib/constants/intervals.ts`** - Time-based constants:
```typescript
KEEP_ALIVE_INTERVAL = 30000  // SSE keep-alive heartbeat
CONNECTION_TIMEOUT = 120000   // Max wait for server connection
RETRY_DELAY = 10000          // Reconnection delay
LIKE_THROTTLE_MS = 500       // Like event throttling
SNAPSHOT_INTERVAL = 15000    // Data snapshot frequency

CHART_INTERVALS = {
  FIFTEEN_MIN: 15 * 60 * 1000,  // 60 data points @ 15s intervals
  SIXTY_MIN: 60 * 60 * 1000     // 240 data points @ 15s intervals
}

LIKES_WINDOWS = {
  LAST_10S: 10, LAST_20S: 20, LAST_30S: 30,
  LAST_45S: 45, LAST_60S: 60
}
```

**`lib/constants/limits.ts`** - Data retention limits:
```typescript
MAX_CHAT_MESSAGES = 50
MAX_GIFTS_DISPLAY = 100
MAX_ACTIVITIES = 50
TOP_USERS = 10
GIFT_FEED_DISPLAY = 50
LIKE_SNAPSHOTS = 120
```

**Usage:** Import from `lib/constants` instead of using raw numbers:
```typescript
import { CHART_INTERVALS, LIMITS } from '@/lib/constants';
```

## Key Technical Patterns

### 1. Server-Sent Events (SSE) for Real-Time Streaming
The app uses SSE instead of WebSocket for client-server communication:
```typescript
// Backend creates ReadableStream
const stream = new ReadableStream({
  start(controller) {
    tiktokConnection.on('chat', (data) => {
      controller.enqueue(`event: chat\ndata: ${JSON.stringify(data)}\n\n`);
    });
  }
});
```

### 2. State Aggregation Pattern
`useTikTokLive` hook aggregates events into comprehensive stats:
- Maintains maps for `giftCatalog`, `userStats`
- Calculates rolling windows for likes/second
- Tracks historical data in arrays with 15-second snapshots

### 3. Singleton Stream Manager
`lib/streamManager.ts` uses singleton pattern for server-side stream management:
```typescript
let streamManagerInstance: StreamManager | null = null;
export function getStreamManager(): StreamManager { ... }
```

### 4. Session Persistence
Stream tabs are persisted in `sessionStorage`:
- Restored on page reload
- Survives tab switches
- Cleared on browser close

## Common Development Tasks

### Adding a New Widget Component

1. Create component in `components/widgets/` or `components/charts/` using `React.memo()`:
```typescript
// components/widgets/MyWidget.tsx
export const MyWidget = React.memo(({ data }: Props) => {
  const memoizedValue = useMemo(() => expensiveCalc(data), [data]);
  return <div>...</div>;
});
```

2. Add export to `components/widgets.ts`:
```typescript
export { MyWidget } from './widgets/MyWidget';
```

3. Import in `StreamMonitor.tsx` and add to JSX
4. Pass relevant stats as props from `useTikTokLive` hook

### Adding a New Event Type

1. Update types in `hooks/useTikTokLive.ts`
2. Add event listener in SSE route: `app/api/tiktok-live/[username]/route.ts`
3. Handle event in `useTikTokLive` hook's EventSource message handler
4. Update relevant widget to display new data

### Debugging Connection Issues

Check these in order:
1. Verify `.env.local` has `EULERSTREAM_API_KEY` (for fallback)
2. Check browser console for SSE connection errors
3. Inspect Network tab for `/api/tiktok-live/[username]` SSE stream
4. Verify stream is actually LIVE on TikTok
5. Check server logs for `tiktok-live-connector` errors

## Tech Stack

- **Next.js 15.5.6** - App Router with Server Components
- **React 19.1.0** - With concurrent features
- **TypeScript 5.9.3** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **Turbopack** - Build tool (faster than Webpack)
- **tiktok-live-connector 2.1.0** - Direct TikTok WebSocket library
- **@eulerstream/euler-websocket-sdk** - Fallback WebSocket SDK

## Project Structure

```
tikscam/
├── app/
│   ├── api/
│   │   ├── tiktok-live/[username]/ # Main SSE endpoint ⭐
│   │   └── tiktok-user/          # User profile API
│   ├── layout.tsx                # Root layout (dark mode only)
│   ├── page.tsx                  # Homepage with StreamTabs
│   └── globals.css               # Tailwind imports
│
├── components/                   # Organized component structure
│   ├── widgets/                  # Analytics widgets (11 files)
│   │   ├── StreamInfoWidget.tsx
│   │   ├── ActivityWidget.tsx
│   │   ├── LikesPerSecondWidget.tsx
│   │   ├── GiftsFeedWidget.tsx
│   │   ├── ViewerTrendWidget.tsx
│   │   ├── GiftListWidget.tsx
│   │   ├── DebugWidget.tsx
│   │   ├── ChatWidget.tsx
│   │   ├── GiftsWidget.tsx
│   │   ├── TopUsersWidget.tsx
│   │   └── ErrorBoundary.tsx     # Error handling
│   │
│   ├── charts/                   # Data visualization (6 files)
│   │   ├── LikesHistoryChart.tsx
│   │   ├── ViewerHistoryChart.tsx
│   │   ├── FollowerHistoryChart.tsx
│   │   ├── DiamondHistoryChart.tsx
│   │   ├── EngagementRateChart.tsx
│   │   └── CombinedTimelineChart.tsx
│   │
│   ├── layout/                   # Page layout (3 files)
│   │   ├── StreamMonitor.tsx     # Main dashboard ⭐
│   │   ├── StreamTabs.tsx        # Multi-stream tab manager
│   │   └── StatsCard.tsx         # Stat display card
│   │
│   ├── dialogs/                  # Modal dialogs (1 file)
│   │   └── AddStreamDialog.tsx   # Add new stream modal
│   │
│   ├── ui/                       # ShadCN base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── tabs.tsx
│   │
│   └── widgets.ts                # Central export barrel file ⭐
│
├── types/                        # Shared TypeScript types ⭐
│   ├── stream.ts                 # Stream data types
│   ├── widgets.ts                # Widget prop types
│   └── index.ts                  # Central export
│
├── hooks/
│   └── useTikTokLive.ts          # Main TikTok connection hook ⭐
│
├── contexts/
│   └── StreamManagerContext.tsx  # Multi-stream state management
│
├── lib/
│   ├── i18n/                     # Internationalization
│   └── utils.ts                  # Utility functions
│
└── .env.local                    # API keys (gitignored)
```

## Important Notes

### Rate Limiting
- Direct TikTok connection: ~10-20 streams/day (free, no key needed)
- With EulerStream API key: 100+ streams/day
- App automatically retries with API key on rate limit

### Data Retention
- Charts show 15-minute history (60 data points @ 15s intervals)
- Chat widget shows last 50 messages
- Gift feed shows last 100 gifts
- All data is client-side only (no persistence)

### Mobile-First Design
- All components are responsive (mobile → tablet → desktop)
- Touch-optimized interactions
- Dark mode only (no light mode)

### Browser Compatibility
- Requires modern browser with EventSource API support
- WebSocket support for EulerStream fallback
- Tested on Chrome, Firefox, Edge, Safari

## Error Handling Patterns

The app has detailed error messages for common issues:
- **Rate limit exceeded** - Shows how to get API key
- **Stream not found** - Guides user to check username/live status
- **Connection lost** - Auto-reconnects after 10 seconds
- **API key invalid** - Clear instructions to update `.env.local`

## Deployment

Optimized for **Vercel** deployment:
- Set `EULERSTREAM_API_KEY` in Vercel environment variables
- Automatic builds on git push
- Supports serverless functions for API routes
- See `DEPLOYMENT.md` for detailed instructions

## Electron Desktop App

### Architecture

The desktop app wraps the Next.js standalone build in Electron:

- **electron/main.ts** - Main process (starts Next.js server, manages window)
- **electron/preload.ts** - Preload script (security layer)
- **electron/dist/** - Compiled TypeScript output
- **.next/standalone/** - Next.js standalone build for Electron

### Key Configuration

**next.config.ts** - Electron-specific settings:
```typescript
output: isElectron ? 'standalone' : undefined,
serverExternalPackages: isElectron ? ['tiktok-live-connector'] : [],
```

**package.json** - Build configuration:
```json
"asarUnpack": [
  "**/*.node",
  "**/node_modules/tiktok-live-connector/**/*"
]
```

### Why Externalize tiktok-live-connector?

The library must NOT be bundled by Next.js because:
- It uses native Node.js Buffer APIs
- WebSocket implementation requires native modules
- Bundling breaks `b.mask()` function (protobuf)
- Must run from `node_modules` with native dependencies

### Build Process

```bash
# Build Electron app
npm run build:electron    # Build Next.js standalone + compile Electron TS
npm run build:win         # Build Windows portable .exe
npm run build:mac         # Build macOS .dmg
npm run build:linux       # Build Linux .AppImage
```

**Build steps:**
1. Next.js builds in standalone mode
2. Copies standalone files to proper structure
3. Compiles TypeScript (electron/main.ts → electron/dist/main.js)
4. electron-builder packages everything into .exe

### Splash Screen (v0.5.0)

**Location:** `electron/main.ts` - `createSplashScreen()` function

The app shows an animated splash screen while loading:
- **Gradient background** (purple → pink)
- **Version display** (shows current version: v0.5.0)
- **Loading animation** - Spinner with status messages
- **Auto-hides** when main window loads

Status messages cycle:
- "Initializing Electron..."
- "Starting Next.js server..."
- "Loading application..."
- "Almost ready..."

### Bundled Node.js (v0.5.0)

**Critical fix:** App now uses Electron's bundled Node.js instead of system Node.

**Implementation in `electron/main.ts`:**
```typescript
// OLD (required system Node.js):
spawn('node', [serverPath], { ... })  // ❌

// NEW (uses Electron's Node.js):
spawn(process.execPath, [serverPath], {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
})  // ✅
```

**Result:** Desktop app is now **truly standalone** - no Node.js installation required on user's system.

### Known Issues & Solutions

**"spawn node ENOENT" error:**
- **Cause:** System doesn't have Node.js installed
- **Fix:** Now uses `process.execPath` with `ELECTRON_RUN_AS_NODE=1` (fixed in v0.5.0)

**"b.mask is not a function" error:**
- **Cause:** tiktok-live-connector was bundled by Next.js
- **Fix:** Use `serverExternalPackages` to externalize it
- **Fix:** Add library to `asarUnpack` in electron-builder config

**"Controller is already closed" error:**
- **Cause:** Events sent after SSE stream closed
- **Fix:** Use `streamClosed` flag to prevent sending after close
- **Fix:** Wrap `controller.enqueue()` in try-catch

### Error Handling

**Error event types:**
- `streamError` - Non-fatal, recoverable (e.g., parsing errors)
- `connectionError` - Fatal connection errors
- EventSource `onerror` - Network failures

### Desktop App Features

- ✅ **Portable .exe** - No installation required
- ✅ **Truly standalone** - Bundled Node.js (v0.5.0), no system dependencies
- ✅ **Splash screen** - Animated loading with version display (v0.5.0)
- ✅ **Self-contained Next.js server** - Runs on port 3456 (auto-detection)
- ✅ **Debug logging** - Logs saved to AppData folder
- ✅ **Same features** - 100% feature parity with web version

## Important

Dont run Build unless told otherwise