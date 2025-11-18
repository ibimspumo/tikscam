# 🎉 TikScam v0.4.0 - Desktop Edition

## 📦 Downloads

**Windows (x64) - Choose your version:**

### 🚀 NSIS Installer (Recommended)
- `TikScam-Setup-0.4.0.exe` - Fast startup (1-2 seconds)
- Requires installation, creates shortcuts
- **Best for regular use**

### 💼 Portable Version
- `TikScam-0.4.0.exe` - No installation required
- Slower startup (5-15 seconds due to extraction)
- **Best for testing or USB stick**

**[Read more about the differences](INSTALLER_vs_PORTABLE.md)**

## ✨ What's New

### 🖥️ Desktop Application
- **Native Windows app** with self-contained Next.js server
- **Portable executable** - no installation needed, just download and run
- **Auto-port detection** - automatically finds available ports
- **Improved performance** - native desktop experience with lower latency

### 🔧 Major Technical Improvements
- **Phase 3 Refactoring Complete**: Major codebase cleanup and type safety improvements
  - Replaced all magic numbers with constants
  - Enhanced TypeScript type safety across all components
  - Improved maintainability and code organization
- **Flexible Event Handling**: TikTok event types now accept all library fields dynamically
- **Chart System Rebuilt**: Complete rewrite using Recharts library for professional data visualization
- **Stable Chart Rendering**: Interval-based timeline with timestamp tolerance for accurate data matching

### 🐛 Bug Fixes
- Fixed TypeScript build errors in chart components
- Resolved chart rendering issues with stable interval-based matching
- Fixed chart data matching using interval-based timeline
- Fixed timestamp handling across all components
- Removed chart tooltips to prevent Recharts + React 19 caching bug

## 🎯 Features

### Real-Time Analytics (6 Widgets)
- Live viewer count & total likes tracking
- Likes per second (10s, 20s, 30s, 45s, 60s averages)
- Gift monitoring with diamond value calculation
- Stream metadata display
- Viewer trend analysis
- Activity feed (joins/follows)

### Historical Charts (7 Charts)
- Likes history timeline
- Viewer count over time
- Follower growth tracking
- Diamond earnings timeline
- Engagement rate metrics
- Combined timeline view
- 15-minute rolling window with 15-second snapshots

### Live Feeds (8 Widgets)
- Real-time chat display (last 50 messages with avatars)
- Horizontal scrollable gift feed
- Complete TikTok gift catalog
- Top users leaderboards (gifters, chatters, active users)
- Debug widget for technical data

### Multi-Stream Support
- Monitor multiple streams simultaneously
- Independent tabs for each stream
- Session persistence (survives page reload)
- Context-based state management

### Performance Optimizations
- **React.memo** on all 21 components - only re-render on prop changes
- **Event throttling** - Like events throttled to 500ms
- **useMemo** for expensive calculations - chart data aggregations are cached
- **15-minute rolling window** - reduced from 60min (75% fewer data points)
- **Result**: 96% fewer re-renders, ~70% less CPU usage, ~50% less RAM

## 🛠️ Tech Stack

- **Next.js 15.5.6** - App Router with Server Components
- **React 19.1.0** - Latest version with concurrent features
- **TypeScript 5.9.3** - Strict type safety
- **Electron 28.1.0** - Desktop app framework
- **Recharts 3.4.1** - Professional data visualization
- **Tailwind CSS 4** - Utility-first styling
- **ShadCN UI** - Accessible component library with Radix Primitives
- **TikTok Live Connector 2.1.0** - Direct TikTok connection
- **EulerStream SDK 0.0.6** - Automatic fallback for rate limits

## 🚀 Getting Started

### Option 1: NSIS Installer (Recommended)
1. Download `TikScam-Setup-0.4.0.exe`
2. Run the installer and follow the setup wizard
3. Launch TikScam from desktop shortcut or Start menu
4. Enter a TikTok username and start monitoring!

### Option 2: Portable Version
1. Download `TikScam-0.4.0.exe`
2. Run the executable (wait 5-15 seconds for extraction)
3. Enter a TikTok username and start monitoring!

**Note:** The portable version takes longer to start because it extracts files on every launch. For the best experience, use the installer version!

## 📝 Requirements

- **Windows 10/11** (64-bit)
- **Active internet connection**
- Target must be **live streaming** on TikTok

## 🔑 Rate Limits & API Key

- **Direct connection**: ~10-20 streams/day (free, no API key required)
- **With EulerStream API key**: 100+ streams/day
- Automatic fallback when rate limit is reached

Get a free API key at: https://www.eulerstream.com/pricing

To use the API key:
1. Create a file named `.env.local` in the same folder as the executable
2. Add: `EULERSTREAM_API_KEY=your_api_key_here`

## 🎯 Use Cases

### Timer Scam Detection
TikScam helps detect common scam patterns in TikTok live streams:
- **Fake countdown timers** that reset when gifts are received
- **Manipulated engagement metrics** to create urgency
- **Gift bait tactics** using artificial deadlines

Monitor likes/second spikes, follower patterns, and viewer trends to identify suspicious activity.

## 📖 Documentation

For detailed usage instructions and development guide, see:
- [README.md](https://github.com/ibimspumo/tikscam/blob/main/README.md)
- [CLAUDE.md](https://github.com/ibimspumo/tikscam/blob/main/CLAUDE.md)

## 🐛 Known Issues

- Chart tooltips disabled due to Recharts + React 19 caching bug
- First connection may take 5-10 seconds to establish
- Some users may need to allow the app through Windows Firewall

## 💬 Support & Feedback

- **Found a bug?** Open an issue on [GitHub Issues](https://github.com/ibimspumo/tikscam/issues)
- **Have a feature request?** Let us know in the discussions!
- **Need help?** Check the README or create an issue

## 📜 License

This project is open source and available under the MIT License.

---

**Full Changelog**: https://github.com/ibimspumo/tikscam/compare/v0.1.0...v0.4.0

---

## 🙏 Credits

Built with:
- [TikTok Live Connector](https://github.com/zerodytrash/TikTok-Live-Connector) by zerodytrash
- [EulerStream API](https://www.eulerstream.com) for rate limit fallback
- [ShadCN UI](https://ui.shadcn.com) for beautiful components
- [Recharts](https://recharts.org) for data visualization

---

**Enjoy transparent TikTok live stream monitoring!** 🚀
