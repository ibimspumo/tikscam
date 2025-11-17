# TikScam Desktop App - User Guide 📱

**Quick guide for end users of the TikScam desktop application.**

---

## 🚀 Getting Started

### 1. Download & Install

1. Go to [Releases](https://github.com/ibimspumo/tikscam/releases)
2. Download the latest version for your platform:
   - **Windows:** `TikScam-Setup.exe`
   - **macOS:** `TikScam.dmg`
   - **Linux:** `TikScam.AppImage`
3. Run the installer and follow the instructions

### 2. First Launch

- **Windows:** Start menu → TikScam
- **macOS:** Applications → TikScam
- **Linux:** Make executable: `chmod +x TikScam.AppImage` then run it

---

## 💎 Adding Your API Key (Optional)

By default, TikScam works without an API key but limits you to **~10-20 streams per day**.

To unlock **unlimited streams**, get a free API key:

### Get Free API Key

1. Visit [eulerstream.com/pricing](https://www.eulerstream.com/pricing)
2. Sign up for a free account
3. Copy your API key

### Add API Key to Desktop App

#### **Windows:**

1. Navigate to: `C:\Users\<YourUsername>\AppData\Local\Programs\TikScam\`
2. Create a file named `.env.local` (note: starts with a dot!)
3. Open it in Notepad and add:
   ```
   EULERSTREAM_API_KEY=your_key_here
   ```
4. Save and restart TikScam

**Tip:** To create `.env.local` in Windows:
- Open Notepad
- Save as → Type `.env.local` in quotes → Save as type: "All Files"

#### **macOS:**

1. Right-click TikScam.app → Show Package Contents
2. Navigate to: `Contents/Resources/app/`
3. Create file `.env.local` with:
   ```
   EULERSTREAM_API_KEY=your_key_here
   ```
4. Save and restart TikScam

**Tip:** Use Terminal:
```bash
cd /Applications/TikScam.app/Contents/Resources/app/
nano .env.local
# Add your key, press Ctrl+X to save
```

#### **Linux:**

1. Extract the AppImage or locate the app directory
2. Create `.env.local` in the same folder
3. Add:
   ```
   EULERSTREAM_API_KEY=your_key_here
   ```
4. Save and restart TikScam

---

## 📊 Usage Limits

| Mode | Streams/Day | API Key Required |
|------|-------------|------------------|
| **Default** | ~10-20 | ❌ No |
| **With API Key** | 100+ | ✅ Yes (Free) |

**Note:** The 10-20 stream limit resets daily and is imposed by TikTok's rate limiting, not by TikScam.

---

## 🆘 Troubleshooting

### App Won't Start

**Windows:**
- Right-click TikScam → Run as Administrator
- Check Windows Defender hasn't blocked it
- Reinstall the app

**macOS:**
- System Settings → Privacy & Security → Allow TikScam
- If "unidentified developer": Right-click → Open (first time only)

**Linux:**
- Make sure the AppImage is executable: `chmod +x TikScam.AppImage`

### "Rate Limit Exceeded" Error

**This means:**
- You've used all 10-20 free connections for today
- TikTok blocks further connections without an API key

**Solutions:**
1. Add an API key (see above) → unlimited connections
2. Wait until tomorrow → limit resets
3. Use the web version at [your-website.com]

### API Key Not Working

**Check:**
1. `.env.local` is in the correct directory
2. File is named exactly `.env.local` (with the dot!)
3. No spaces around the `=` sign
4. API key is correct (copy-paste from eulerstream.com)
5. Restarted TikScam after adding the key

**Debug:**
- Windows: Check console logs in `%APPDATA%\TikScam\logs\`
- Look for "✅ Loaded env variable: EULERSTREAM_API_KEY"

### Stream Shows "Not Found"

**Reasons:**
- Stream is not LIVE (most common!)
- Username is incorrect (check for typos)
- Account is private
- TikTok is blocking access temporarily

**Fix:**
- Verify the stream is actually live on TikTok
- Double-check the username (without @)
- Try again in a few minutes

---

## 🔄 Updates

### How to Update

1. Download the latest version from [Releases](https://github.com/ibimspumo/tikscam/releases)
2. Install over the old version
3. Your API key settings are preserved!

**Auto-updates:** Coming in a future version

---

## 🔒 Privacy & Security

### What Data Does TikScam Collect?

**None.** TikScam:
- ✅ Runs locally on your computer
- ✅ Only connects to TikTok Live streams (public data)
- ✅ Doesn't send any data to our servers
- ✅ Doesn't collect analytics or telemetry

### Is My API Key Safe?

- ✅ Stored locally in `.env.local` on your computer
- ✅ Never transmitted to anyone except EulerStream
- ✅ Only used when TikTok rate limit is hit

---

## 📞 Support

### Need Help?

- **Issues:** [GitHub Issues](https://github.com/ibimspumo/tikscam/issues)
- **Questions:** [GitHub Discussions](https://github.com/ibimspumo/tikscam/discussions)
- **Documentation:** [README.md](https://github.com/ibimspumo/tikscam#readme)

### Common Questions

**Q: Is TikScam free?**
A: Yes! Both the app and the basic API key are completely free.

**Q: Do I need a TikTok account?**
A: No! TikScam only reads publicly available stream data.

**Q: Can I use this to monitor my own stream?**
A: Yes! Enter your own username to see your stream analytics.

**Q: Does this work on mobile?**
A: Desktop app is Windows/Mac/Linux only. Use the web version for mobile.

**Q: Can I monitor multiple streams at once?**
A: Yes! Use the tab system to monitor several streams simultaneously.

---

## ⚖️ Legal

**Disclaimer:**
- TikScam is for educational and transparency purposes only
- Use responsibly and ethically
- Respect streamer privacy
- Don't use for harassment or spam
- TikTok is a trademark of ByteDance Ltd.

**License:** MIT License

---

**Made with ❤️ for transparency and fair streams**

*Protect yourself from scams. Support honest creators.*
