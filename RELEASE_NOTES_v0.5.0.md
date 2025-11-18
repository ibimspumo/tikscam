# Release Notes - v0.5.0

**Release Date:** January 2025

## Overview

Version 0.5.0 brings comprehensive documentation improvements, critical bug fixes, and enhanced desktop experience. This release focuses on developer experience with a completely rewritten README and fixes for data transmission issues that affected stream monitoring accuracy.

## Key Changes

### Documentation
- **Completely rewritten README.md** – Expanded from 221 to 519 lines with detailed technical context, architecture diagrams, and Claude Code attribution
- Added comprehensive "What is TikScam?" introduction explaining the project's purpose
- Detailed SSE event types, data structures, and performance optimizations
- Enhanced ethical usage guidelines and disclaimer section

### Bug Fixes
- **Fixed total likes display** – Stats cards now show actual stream total (`streamTotalLikes`) instead of session count
- **Fixed gift catalog loading** – Gift catalog now correctly displays ~100+ available gifts from TikTok API
- **Fixed missing translations** – Added `viewers`, `gifts`, and `diamonds` keys to English locale
- **Fixed TypeScript types** – Added `profilePictureUrl` property to UserProfile interface for production builds

### Desktop Enhancements
- **Added animated splash screen** – Beautiful gradient splash with loading animation shown on app startup
- Updated splash screen version display to v0.5.0
- Added INSTALLER_vs_PORTABLE.md comparison guide

### Package Updates
- Bumped version to 0.5.0 across package.json and package-lock.json
- Updated all version references in documentation and splash screen

## Technical Details

**Files Changed:** 13 files modified
**Lines Added:** 603 insertions
**Lines Removed:** 749 deletions

**Key Commits:**
1. `b13b9df` - Release v0.5.0 - Streamlined developer documentation
2. `33891f5` - Fix: Critical data transmission bugs in stream monitoring
3. `dd4e1a8` - Update package-lock.json to v0.5.0
4. `1dfd329` - Add: Electron splash screen and documentation

## Upgrade Notes

No breaking changes. Simply pull the latest version and restart the application.

---

**Built with ❤️ and 🤖 by [Claude Code](https://claude.ai/code)**
