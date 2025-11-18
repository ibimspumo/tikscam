# TikScam - Installer vs Portable Version

## 📦 Two Download Options

Starting with v0.4.0, TikScam is available in **two versions**:

### 1. 🚀 **NSIS Installer** (Recommended)
- **File:** `TikScam-Setup-0.4.0.exe`
- **Size:** ~200 MB
- **Startup time:** 1-2 seconds ⚡
- **Installation required:** Yes (one-time setup)
- **Best for:** Regular use, daily monitoring

#### ✅ Advantages:
- **Fast startup** - App launches almost instantly
- **Desktop shortcut** - Easy access from desktop
- **Start menu entry** - Find app in Windows Start menu
- **Auto-updates** ready (future feature)
- **Uninstaller included** - Clean removal via Windows Settings

#### 📝 Installation:
1. Download `TikScam-Setup-0.4.0.exe`
2. Run the installer
3. Choose installation directory (or use default)
4. Wait for installation (~30 seconds)
5. Launch TikScam from desktop or Start menu

---

### 2. 💼 **Portable Version**
- **File:** `TikScam-0.4.0.exe`
- **Size:** ~200 MB
- **Startup time:** 5-15 seconds ⏳
- **Installation required:** No
- **Best for:** Temporary use, USB stick, testing

#### ✅ Advantages:
- **No installation** - Just download and run
- **USB-ready** - Run from any location
- **Leave no traces** - No registry entries
- **Easy cleanup** - Just delete the .exe

#### ⚠️ Disadvantages:
- **Slow startup** - Takes 5-15 seconds to launch
- **Temporary extraction** - Unpacks files on every start (~1GB)
- **No shortcuts** - Must keep track of .exe location
- **Uses more disk I/O** - Extracts to temp folder each time

#### 📝 Usage:
1. Download `TikScam-0.4.0.exe`
2. Place it anywhere (Desktop, USB stick, etc.)
3. Double-click to run
4. **Wait 5-15 seconds** for initial extraction
5. Splash screen appears, then app loads

---

## 🤔 Which Version Should I Choose?

### Choose **NSIS Installer** if:
- ✅ You plan to use TikScam regularly
- ✅ You want fast startup times
- ✅ You don't mind installing software
- ✅ You want Windows integration (shortcuts, Start menu)

### Choose **Portable** if:
- ✅ You want to test TikScam first
- ✅ You need to run it from USB stick
- ✅ You can't install software on your system
- ✅ You don't mind waiting 5-15 seconds on startup

---

## ❓ Why is Portable So Slow?

The portable version **extracts ~1GB of files** to a temporary folder **every time you run it**:

1. You double-click `TikScam-0.4.0.exe`
2. Windows extracts compressed app to `%TEMP%` (~1GB)
3. **5-15 seconds pass** (depending on CPU/disk speed)
4. Electron starts
5. Splash screen appears
6. App loads

**NSIS Installer does this ONCE during installation**, so subsequent launches are instant!

---

## 🔒 Security Notes

Both versions are **identical in functionality** and **equally safe**:

- Same code, same features
- Both versions log to `%APPDATA%\tikscam\tikscam-debug.log`
- Both support `.env.local` for API keys
- Both are code-signed (future versions)

The only difference is **how they're packaged**.

---

## 📊 Performance Comparison

| Feature | NSIS Installer | Portable |
|---------|---------------|----------|
| **First Launch** | 1-2 seconds | 5-15 seconds |
| **Subsequent Launches** | 1-2 seconds | 5-15 seconds |
| **Disk Space** | ~1.2 GB (installed) | ~200 MB + temp files |
| **Installation Time** | ~30 seconds | 0 seconds |
| **Startup Feel** | Instant | Noticeable delay |

---

## 💡 Pro Tip

**For the best experience, use the NSIS Installer version!**

The portable version is great for testing, but the installer provides a much better user experience with near-instant startup times.

---

## 🐛 Troubleshooting Slow Startup

If you're using the **Portable version** and startup is extremely slow (>20 seconds):

1. **Disable antivirus temporarily** - Some antivirus programs scan extracted files aggressively
2. **Use an SSD** - Extraction to HDD is much slower than SSD
3. **Close background apps** - Free up CPU and disk I/O
4. **Consider switching to NSIS Installer** - Permanent solution!

If you're using the **NSIS Installer** and startup is slow:

1. Check the debug log: `%APPDATA%\tikscam\tikscam-debug.log`
2. Report the issue on GitHub with the log file
3. This shouldn't happen - installer version should be fast!

---

## 📞 Support

Found a bug or have questions?
- **GitHub Issues:** https://github.com/ibimspumo/tikscam/issues
- **Debug Log Location:** `%APPDATA%\tikscam\tikscam-debug.log`

---

**TikScam v0.4.0** - Transparent TikTok Live Stream Analytics 🎭
