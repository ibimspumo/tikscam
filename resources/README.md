# App Icons

Place your app icons here for Electron builds:

## Required Icons

- `icon.ico` - Windows (256x256 or larger)
- `icon.icns` - macOS (512x512 or larger)
- `icon.png` - Linux (512x512)

## Generate Icons

### Online Tools (Easiest)

1. **PNG → ICO (Windows):** https://www.icoconverter.com/
2. **PNG → ICNS (macOS):** https://cloudconvert.com/png-to-icns

### Design Tips

- Start with a 1024x1024 PNG
- Simple design (readable at small sizes)
- High contrast
- No text (unreadable at 16x16)

## Without Icons

The build will work without icons, but will use the default Electron icon.

To build with default icons, simply leave this folder empty or only with this README.
