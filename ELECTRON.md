# TikScam Desktop App Guide 💻

Complete guide for building and distributing TikScam as a standalone desktop application.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [First-Time Setup](#first-time-setup)
- [Development](#development)
- [Building](#building)
- [Icons](#icons)
- [Distribution](#distribution)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

TikScam can be built as a desktop application for Windows, macOS, and Linux using **Electron**.

### Architecture

```
┌─────────────────────────────────────┐
│  Electron (Desktop Shell)          │
│  ├── Main Process (Node.js)        │
│  │   └── electron/main.ts          │
│  │       ├── Starts Next.js Server │
│  │       └── Creates Window        │
│  │                                  │
│  └── Renderer Process (Browser)    │
│      └── Next.js App (localhost)   │
│          └── Your React Components │
└─────────────────────────────────────┘
```

**Key Points:**
- ✅ **100% same code** as web version
- ✅ Next.js runs as standalone server inside Electron
- ✅ API routes, SSE, WebSockets all work
- ✅ No code duplication

---

## 🔧 Prerequisites

1. **Node.js 20+** installed
2. **npm** or **yarn**
3. **Platform-specific requirements:**

   **Windows:**
   - No additional requirements

   **macOS:**
   - Xcode Command Line Tools: `xcode-select --install`

   **Linux:**
   - `libgtk-3-dev`, `libnotify-dev`, `libnss3`, etc.
   - Install with: `sudo apt install libgtk-3-dev libnotify-dev libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0`

---

## 🚀 First-Time Setup

### 1. Install Dependencies

```bash
npm install
```

This will install both web and Electron dependencies.

### 2. Create App Icons (Optional but Recommended)

Create a `resources/` folder and add icons:

```
resources/
├── icon.ico       # Windows (256x256 or larger)
├── icon.icns      # macOS (512x512 or larger)
└── icon.png       # Linux (512x512 or larger)
```

**Where to get icons:**
- Use https://www.icoconverter.com/ to convert PNG → ICO/ICNS
- Free icons: https://www.flaticon.com/ or https://icons8.com/

**Skip icons:** The build will work without icons, but your app will have a default Electron icon.

---

## 💻 Development

### Run Desktop App in Development Mode

```bash
npm run dev:electron
```

This will:
1. Start Next.js dev server on `localhost:3000`
2. Open Electron window pointing to the dev server
3. Enable hot reload (changes reflect immediately)
4. Open DevTools for debugging

**Note:** Make sure port 3000 is free!

### Development vs Production

| Feature | `npm run dev:electron` | Production Build |
|---------|------------------------|------------------|
| Next.js | Dev server | Standalone server |
| Turbopack | ✅ Enabled | ❌ Disabled |
| Hot Reload | ✅ Yes | ❌ No |
| DevTools | ✅ Auto-open | ❌ Disabled |
| Speed | Fast | Optimized |

---

## 🏗️ Building

### Build for Windows

```bash
npm run build:win
```

**Output:** `dist/TikScam Setup.exe` (~150 MB)

**What it creates:**
- NSIS installer (.exe)
- Allows custom install directory
- Creates desktop + start menu shortcuts
- Uninstaller included

### Build for macOS

```bash
npm run build:mac
```

**Output:** `dist/TikScam.dmg` (~120 MB)

**What it creates:**
- DMG disk image
- Drag-to-Applications installer
- Code-signed (if certificates configured)

### Build for Linux

```bash
npm run build:linux
```

**Output:** `dist/TikScam.AppImage` (~130 MB)

**What it creates:**
- Portable AppImage (no installation required)
- Works on most Linux distros

### Build All Platforms

```bash
npm run build:electron
```

### Public Release Build (Without .env)

**For distributing to users who don't have an API key:**

The app works perfectly **without** a `.env.local` file! Users are limited to ~10-20 streams/day (direct TikTok connection), but the app remains fully functional.

```bash
# 1. Make sure NO .env.local is in your project
rm .env.local  # or rename it to .env.local.backup

# 2. Build normally
npm run build:win

# Result: dist/TikScam Setup.exe
# ✅ Works without API key
# ✅ Users can add .env.local later if they want
```

**Where users can add .env.local later:**

After installing your distributed .exe, users can create `.env.local` in:
- **Windows:** `C:\Users\<Username>\AppData\Local\Programs\TikScam\.env.local`
- **macOS:** `/Applications/TikScam.app/Contents/Resources/app/.env.local`
- **Linux:** Same directory as the AppImage

**Template for users:**
```bash
# Copy .env.example to .env.local and add your API key
EULERSTREAM_API_KEY=your_key_here
```

The app will automatically detect and load the file on next start!

---

## 🎨 Icons

### Required Icon Formats

Electron-builder needs platform-specific icons:

| Platform | Format | Size | Filename |
|----------|--------|------|----------|
| Windows | `.ico` | 256x256+ | `resources/icon.ico` |
| macOS | `.icns` | 512x512+ | `resources/icon.icns` |
| Linux | `.png` | 512x512 | `resources/icon.png` |

### Create Icons from PNG

1. **Start with a high-quality PNG** (1024x1024 recommended)

2. **Convert to platform formats:**

   **Windows (.ico):**
   ```bash
   # Online: https://www.icoconverter.com/
   # Or use ImageMagick:
   magick convert icon.png -resize 256x256 icon.ico
   ```

   **macOS (.icns):**
   ```bash
   # Use online tool: https://cloudconvert.com/png-to-icns
   # Or use iconutil on macOS:
   mkdir icon.iconset
   sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
   iconutil -c icns icon.iconset
   ```

   **Linux (.png):**
   ```bash
   # Just use your PNG file (512x512)
   cp icon.png resources/icon.png
   ```

### Design Tips

- **Simple is better** - Icons look tiny in taskbars
- **High contrast** - Make it stand out
- **No text** - Text is unreadable at small sizes
- **Test at small sizes** - View at 16x16, 32x32, 64x64

---

## 📦 Distribution

### Hosting Options

#### 1. **GitHub Releases (Recommended)**

```bash
# Tag a release
git tag v0.1.0
git push origin v0.1.0

# Upload builds to GitHub Releases
# Go to: https://github.com/your-username/tikscam/releases
# Create new release and upload files from dist/
```

#### 2. **Auto-Updates with GitHub Releases**

Add to `electron/main.ts`:

```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

Config in `package.json`:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "tikscam"
  }
}
```

#### 3. **Direct Download**

Host on:
- Your website
- Google Drive / Dropbox
- SourceForge
- Microsoft Store / Mac App Store (requires developer account)

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Windows
npx kill-port 3000

# Mac/Linux
lsof -ti:3000 | xargs kill

# Or change port in electron/main.ts:
const PORT = 3001;
```

### Build Fails on Windows

**Error:** "wine not found"

**Solution:** Wine is only needed for cross-platform builds. Build on the target platform instead.

**Error:** "cannot find module 'electron'"

**Solution:**
```bash
npm install
npm run postinstall
```

### App Window is Blank

**Causes:**
1. Next.js server didn't start
2. Port conflict
3. Firewall blocking localhost

**Debug:**
```bash
# Check Electron logs
npm run dev:electron
# Look for "Next.js server is ready!" message
```

**Fix:**
```typescript
// In electron/main.ts, increase timeout:
await new Promise(resolve => setTimeout(resolve, 5000));
```

### .env.local Not Loaded

**Production builds:**
- Place `.env.local` in the **app installation directory**
- Not next to the `.exe` - inside the installed app folder

**Development:**
- `.env.local` should be in project root (works automatically)

### Build Size Too Large

**Normal sizes:**
- Windows: ~150 MB
- macOS: ~120 MB
- Linux: ~130 MB

**Why so big?**
- Includes entire Chromium engine
- Includes Node.js runtime
- Includes all node_modules

**Reduce size:**
1. Use `asarUnpack` for selective files
2. Use `electronDist` from cache
3. Enable compression in electron-builder config

---

## 🔐 Security

### Code Signing (Optional but Recommended)

**Windows:**
```bash
# Get certificate from DigiCert, Sectigo, etc.
# Add to electron-builder config:
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

**macOS:**
```bash
# Requires Apple Developer Account ($99/year)
# Add to electron-builder config:
"mac": {
  "identity": "Developer ID Application: Your Name"
}
```

**Linux:**
- No code signing required

---

## 📊 Build Configuration

All build settings are in `package.json` under the `"build"` key.

### Key Settings

```json
{
  "build": {
    "appId": "com.tikscam.app",           // Unique app ID
    "productName": "TikScam",              // Display name
    "directories": {
      "output": "dist"                     // Where builds go
    },
    "files": [                             // What to include
      ".next/standalone/**/*",
      "electron/dist/**/*"
    ],
    "win": { ... },                        // Windows config
    "mac": { ... },                        // macOS config
    "linux": { ... }                       // Linux config
  }
}
```

---

## 🎓 Advanced Topics

### Custom Electron Features

You can add native desktop features to Electron:

**System Tray:**
```typescript
import { Tray, Menu } from 'electron';

const tray = new Tray('path/to/icon.png');
tray.setContextMenu(Menu.buildFromTemplate([...]));
```

**Notifications:**
```typescript
import { Notification } from 'electron';

new Notification({
  title: 'New Gift!',
  body: 'Someone sent a Galaxy gift!'
}).show();
```

**File System Access:**
```typescript
import { dialog } from 'electron';

const { filePath } = await dialog.showSaveDialog({
  defaultPath: 'stream-data.csv'
});
```

### IPC (Inter-Process Communication)

Share data between main and renderer:

**Main Process:**
```typescript
// electron/main.ts
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
```

**Renderer Process (React):**
```typescript
// Use via window.electron (exposed in preload.ts)
const version = await window.electron.getVersion();
```

---

## 📚 Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Guide](https://www.electron.build/)
- [Next.js + Electron Examples](https://github.com/vercel/next.js/tree/canary/examples/with-electron)

---

## ✅ Checklist Before Release

- [ ] Test on target platform(s)
- [ ] Add app icons (resources/)
- [ ] Test with .env.local file
- [ ] Verify all features work offline
- [ ] Check app size (< 200 MB)
- [ ] Code sign (Windows/macOS)
- [ ] Test installer/uninstaller
- [ ] Write release notes
- [ ] Upload to GitHub Releases

---

**Made with ❤️ using Electron + Next.js**
