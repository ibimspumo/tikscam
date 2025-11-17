# TikScam Changelog

## [0.2.0] - 2025-11-17

### 🎉 Major Refactoring & Code Quality Improvements

This release focuses on **code quality, maintainability, and developer experience**.

### ✨ New Features

**Component Organization**
- Reorganized all components into logical subdirectories:
  - `components/widgets/` - 11 analytics widgets
  - `components/charts/` - 6 data visualization components
  - `components/layout/` - 3 page layout components
  - `components/dialogs/` - 1 modal dialog
- Updated barrel export in `components/widgets.ts`
- Improved project navigation and code discovery

**Shared Type System**
- Created `types/stream.ts` with all stream-related types
- Created `types/widgets.ts` with widget prop patterns
- Created `types/index.ts` as central export
- Eliminated type duplication across multiple files

**Error Boundaries**
- Added `ErrorBoundary` component for graceful error handling
- Created `WidgetErrorBoundary` wrapper for critical widgets
- Wrapped `CombinedTimelineChart`, `ChatWidget`, `GiftsFeedWidget`
- Prevents widget crashes from breaking entire app

### 🔧 Code Quality Improvements

**TypeScript Strict Mode**
- Eliminated 6 `any` types from `useTikTokLive.ts`
- Proper typing for event handlers (Event → MessageEvent)
- Type-safe gift catalog and user stats
- Zero `any` types in hook logic

**ESLint Configuration**
- Created `eslint.config.mjs` with custom rules
- Added rules for console usage, prefer-const, no-any
- Integrated with Next.js core web vitals

**Prettier Setup**
- Created `.prettierrc` for consistent formatting
- Created `.prettierignore` for build artifacts
- Enforces 100-char line width, single quotes, 2-space tabs

### 📚 Documentation

**Modern README**
- Completely rewritten to current GitHub standards
- Added comprehensive table of contents
- Platform download table (Windows available, others build from source)
- Developer-friendly with architecture diagrams
- Clear contributing guidelines
- Proper badges and visual hierarchy

**Updated IMPROVEMENTS.md**
- Marked all completed tasks from High Priority
- Updated Known Issues with completion status
- Added "Recent Accomplishments" section for v0.2.0

### 🐛 Bug Fixes

**Vercel Deployment**
- Fixed "b.mask is not a function" error
- Always externalize `tiktok-live-connector` in `next.config.ts`

**Connection Retry UX**
- Added `retrying` event to inform user of API key fallback
- Improved error messaging during connection attempts
- Better distinction between fatal and recoverable errors

**Build Errors**
- Fixed icon import conflicts (Gift → GiftIcon, Activity → ActivityIcon)
- Fixed module not found errors after component reorganization
- Fixed prefer-const ESLint errors

### 📊 Metrics

- **~2,000 lines removed** (cleanup of unused files)
- **~355 lines added** (quality code: types, error boundaries, configs)
- **Build status:** ✅ All builds successful
- **Bundle size:** Unchanged at 137 kB
- **TypeScript errors:** 0
- **ESLint errors:** 0 (only warnings remain)

### 🗂️ Files Changed

**Created:**
- `types/stream.ts` - Stream data types
- `types/widgets.ts` - Widget prop patterns
- `types/index.ts` - Central type export
- `components/widgets/ErrorBoundary.tsx` - Error handling
- `.prettierrc` - Code formatting config
- `.prettierignore` - Prettier exclusions

**Modified:**
- `README.md` - Complete rewrite to modern standards
- `IMPROVEMENTS.md` - Updated completion status
- `package.json` - Version bump to 0.2.0
- `eslint.config.mjs` - Custom rules added
- `hooks/useTikTokLive.ts` - Type safety improvements
- `components/widgets.ts` - Updated exports for new structure
- 21 component files - Moved to new directories

**Reorganized:**
- Moved 11 widgets to `components/widgets/`
- Moved 6 charts to `components/charts/`
- Moved 3 layout components to `components/layout/`
- Moved 1 dialog to `components/dialogs/`

### 🔄 Breaking Changes

None - All changes are internal refactoring. Public API remains unchanged.

---

## [0.1.0] - 2025-11-17 - Electron Desktop App Bug Fixes

### 🐛 Critical Bug Fixes

**Fixed "b.mask is not a function" error in Electron builds**
- Root cause: Next.js bundled `tiktok-live-connector` which broke native Buffer APIs
- Solution: Externalized the library using `serverExternalPackages` config
- Added `asarUnpack` for tiktok-live-connector to prevent bundling issues
- Set `processInitialData: false` to reduce protobuf parsing errors

**Fixed "Controller is already closed" error**
- Added `streamClosed` flag to prevent events after stream closure
- Wrapped all `controller.enqueue()` calls in try-catch
- Proper cleanup in all disconnect handlers
- Fixed race conditions in SSE stream management

### 🎨 Improvements

**Cleaned up excessive logging**
- Removed debug logs from production builds
- EventSource retry errors now silent (only fatal errors logged)
- Electron renderer only logs warnings/errors (not info)
- Backend errors properly categorized (streamError vs connectionError)

**Better error handling architecture**
- `streamError` - Non-fatal, recoverable errors (e.g., parsing issues)
- `connectionError` - Fatal connection errors
- EventSource `onerror` - True network failures
- Try-catch protection for all event handlers

### 📝 Changed Files

- `app/api/tiktok-live/[username]/route.ts` - Stream close handling, error architecture
- `hooks/useTikTokLive.ts` - Cleaned logging, silent retries
- `electron/main.ts` - Reduced console logging
- `next.config.ts` - Added serverExternalPackages for Electron
- `package.json` - Updated asarUnpack configuration

### ✅ Desktop App Status

- ✅ Connects reliably to TikTok Live streams
- ✅ Clean logs without spam
- ✅ Proper error handling
- ✅ No more Buffer/mask errors
- ✅ Stable SSE connections

---

## 2024-10-21 - Massive Performance-Verbesserungen

### 🚀 Performance-Optimierungen

#### Problem
Die Anwendung war extrem performance-intensiv und führte zu PC-Abstürzen:
- Bei jedem Like-Event (50+ mal/Sek) wurden alle 20+ Komponenten neu gerendert
- Keine React-Optimierungen (kein memo, kein useMemo)
- 60 Minuten History = 240 Datenpunkte pro Chart
- Keine Throttling für State-Updates

#### Lösung
**1. React.memo für alle Komponenten ✅**
- Alle Widget-Komponenten nutzen jetzt `React.memo()`
- Komponenten rendern nur noch bei Prop-Änderungen
- Betrifft: ChatWidget, StatsWidget, LikesHistoryChart, ViewerHistoryChart, etc.

**2. useMemo für teure Berechnungen ✅**
- Chart-Berechnungen werden gecacht
- Aggregationen nur bei Änderung
- Massive CPU-Einsparung

**3. Throttling für Like-Events ✅**
- Vorher: 50+ State-Updates pro Sekunde
- Nachher: Max. 2 Updates pro Sekunde (500ms Throttle)
- **96% weniger Re-Renders!**

**4. History-Daten reduziert ✅**
- Vorher: 60 Minuten = 240 Datenpunkte
- Nachher: 15 Minuten = 60 Datenpunkte
- **75% weniger Daten!**

#### Erwartete Verbesserung

| Metrik | Vorher | Nachher | Verbesserung |
|--------|--------|---------|--------------|
| Re-Renders/Sek | 50+ | 2 | **96% weniger** |
| Chart-Datenpunkte | 240 | 60 | **75% weniger** |
| CPU-Last | Sehr hoch | Niedrig | **~70% weniger** |
| RAM-Nutzung | Hoch | Mittel | **~50% weniger** |

### 🔧 Error-Handling verbessert

#### Bessere Fehlermeldungen
- Rate-Limit-Fehler werden jetzt klar erklärt
- Mehrzeilige, gut lesbare Fehlermeldungen
- Direkter Link zum API-Key holen

#### UI-Verbesserungen
- ⚠️ Fehler-Icon
- Strukturierter Text mit Lösungsvorschlägen
- 🔑 Button zu eulerstream.com/pricing

### 📝 Geänderte Dateien

#### Hooks
- `hooks/useTikTokLive2.ts`
  - Throttling implementiert (500ms)
  - History auf 15min reduziert
  - Besseres Error-Handling

#### Komponenten
- `components/ChatWidget.tsx` - React.memo
- `components/StatsWidget.tsx` - React.memo
- `components/LikesHistoryChart.tsx` - React.memo + useMemo + 15min
- `components/ViewerHistoryChart.tsx` - React.memo + useMemo + 15min
- `components/DiamondHistoryChart.tsx` - React.memo + useMemo + 15min
- `components/FollowerHistoryChart.tsx` - React.memo + useMemo + 15min
- `components/EngagementRateChart.tsx` - React.memo + useMemo + 15min
- `components/GiftsWidget.tsx` - React.memo + useMemo
- `components/ActivityWidget.tsx` - React.memo + useMemo
- `components/StreamMonitor.tsx` - Verbessertes Error-Display

#### API
- `app/api/tiktok-live/[username]/route.ts` - Besseres Error-Handling

### 📚 Dokumentation

Neue Dateien:
- `PERFORMANCE_OPTIMIERUNGEN.md` - Details zu allen Optimierungen
- `RATE_LIMIT_LÖSUNG.md` - Wie man API-Key einrichtet
- `CHANGELOG.md` - Diese Datei

### ⚠️ Bekannte Probleme

#### Rate Limit
TikTok-Verbindungen nutzen einen externen Signature-Service, der limitiert ist:
- Kostenlos: ~10-20 Verbindungen/Tag
- Mit API-Key: 100+ Verbindungen/Tag

**Lösung:**
1. Warten bis morgen (Limit wird täglich zurückgesetzt)
2. Kostenlosen API-Key holen: https://www.eulerstream.com/pricing
3. Setup-Anleitung: siehe `RATE_LIMIT_LÖSUNG.md`

### 🎯 Nächste Schritte

Empfohlene weitere Optimierungen (optional):
1. React-Window für Virtualisierung langer Listen
2. Lazy Loading für Komponenten
3. WebWorker für Berechnungen
4. IndexedDB für History-Speicherung

### 🙏 Credits

Performance-Optimierungen basierend auf:
- React Best Practices
- Chrome DevTools Performance Profiling
- Real-world Testing mit High-Traffic Streams
