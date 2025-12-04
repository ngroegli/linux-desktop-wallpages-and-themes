# Hidamari Integration

[Hidamari](https://github.com/jeffshee/hidamari) is an animated wallpaper engine that can display HTML files as desktop backgrounds.

## How This Project Works with Hidamari

Hidamari requires **single-file HTML wallpapers** with all dependencies embedded (CSS, JavaScript, assets). It cannot load external files or make external HTTP requests reliably.

### Compilation Process

Use the `build.sh` script to compile themes into standalone HTML files:

```bash
cd ~/WallpagesThemes
./build.sh
```

This generates single-file wallpapers in `~/WallpagesThemes/compiled/`:
- `wallpaper-matrix-rain.html`
- `wallpaper-arctic.html`
- `wallpaper-threat-map.html`
- ... (one for each of the 12 themes)

### What Gets Embedded

Each compiled wallpaper contains:
- ✅ **All CSS** - Inlined into `<style>` tags
- ✅ **All JavaScript** - Embedded inline (template.js, background-manager.js, theme-specific background.js)
- ✅ **Theme configuration** - Colors, settings baked into the code
- ✅ **Animation logic** - Canvas 2D drawing code
- ❌ **No external files** - No network requests, no file loading

### Limitations with Hidamari

Because Hidamari isolates the HTML file:
- **Static theme** - Cannot switch themes (each file is one theme)
- **No config changes** - Configuration is embedded at build time

For dynamic features (API polling, theme switching), use the multi-file version in a browser instead.

### Setting Up Hidamari

1. Build the wallpapers: `./build.sh`
2. Install Hidamari: See [installation guide](https://github.com/jeffshee/hidamari)
3. Add wallpaper in Hidamari UI:
   - Click "Add"
   - Navigate to `~/WallpagesThemes/compiled/`
   - Select `wallpaper-<theme>.html`
   - Apply

See `docs/architecture/` for complete system architecture diagrams.