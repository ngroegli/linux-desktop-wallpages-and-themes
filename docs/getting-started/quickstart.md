# Quick Reference Guide

## Installation (One-time Setup)

```bash
# Install Flask API as systemd service
sudo ./install.sh

# Verify service is running
sudo systemctl status web-wallpaper-api

# Test API
curl http://localhost:5000/api/health
```

## Configuration

Edit `theme/base/config.json`:

```json
{
  "theme": "ubuntu",             // Theme: matrix-green-blue, ice-blue, ubuntu, clair-obscur
  "image": "",                   // Center image path (empty = no image)
  "showImage": false,            // Show/hide image placeholder (default: false)
  "title": "Your Title Here",    // Center title text
  "showTitle": false,            // Show/hide title text (default: false)
  "apiBase": "http://localhost:5000"  // Flask API URL
}
```

Note: Background effects are theme-specific:
- `matrix-green-blue`: Matrix rain animation
- `ice-blue`: Arctic scene with icebergs and snowfall
- `ubuntu`: Animated Ubuntu Circle of Friends logo
- `clair-obscur`: Art Deco design with golden particles

## Using the Wallpaper

**For Hidamari (single-file):**
1. After installation, open `~/WallpagesThemes/wallpaper-<theme>.html`
2. Example: `~/WallpagesThemes/wallpaper-ubuntu.html`

**For Browser (multi-file):**
1. Open `~/WallpagesThemes/base/background.html`
2. Change theme in `config.json`

**Note:** If API is unreachable, stats will be randomized (shows "RANDOMIZED" status)

## Service Management

```bash
# Check status
sudo systemctl status web-wallpaper-api

# Restart
sudo systemctl restart web-wallpaper-api

# View logs
sudo journalctl -u web-wallpaper-api -f

# Stop
sudo systemctl stop web-wallpaper-api

# Disable autostart
sudo systemctl disable web-wallpaper-api
```

## Building Single-File Wallpapers

After making changes, rebuild the single-file wallpapers for Hidamari:

```bash
# Build all themes (output to ./output directory)
./build.sh

# Or run the installer (rebuilds automatically to ~/WallpagesThemes)
sudo ./install.sh
```

This generates:
- `wallpaper-matrix-green-blue.html`
- `wallpaper-ice-blue.html`
- `wallpaper-ubuntu.html`
- `wallpaper-clair-obscur.html`

## Creating a New Theme

1. Create folder: `theme/your-theme-name/`

2. Create `theme/your-theme-name/theme.json`:

```json
{
  "--bg-color": "#071018",
  "--accent-1": "#00ff88",
  "--accent-2": "#00ddff",
  "--panel-bg": "rgba(0,20,20,0.7)",
  "--panel-border": "rgba(0,255,136,0.18)",
  "--panel-shadow": "rgba(0,255,136,0.12)",
  "--title-shadow": "rgba(0,221,255,0.25)",
  "backgroundMode": "your-custom-mode"
}
```

3. (Optional) Create `theme/your-theme-name/background.js` for custom animations
   - See `theme/matrix-green-blue/background.js` or `theme/ubuntu/background.js` for examples
   - Must expose `window.THEME_BACKGROUND = { start, stop }`

4. Update `theme/base/config.json`:
```json
{ "theme": "your-theme-name", ... }
```

## Runtime Control (Browser Console)

```javascript
// Change theme
WALLPAPER_TEMPLATE.setThemeName('ubuntu');

// Change image and title
WALLPAPER_TEMPLATE.setCenterImage('/path/to/image.png');
WALLPAPER_TEMPLATE.setTitle('New Title');

// Load specific theme's background
WALLPAPER_BACKGROUND.loadThemeBackground('ubuntu', 'ubuntu-logo');

// Apply theme object directly
WALLPAPER_TEMPLATE.applyTheme({
  '--accent-1': '#ff0000',
  '--accent-2': '#00ff00'
});
```

## File Locations

**Installed (after running install.sh):**
- **Hidamari wallpapers**: `~/WallpagesThemes/_output/wallpaper-*.html`
- **Browser wallpaper**: `~/WallpagesThemes/_base/background.html`
- **Config**: `~/WallpagesThemes/config/config.json`
- **Themes**: `~/WallpagesThemes/themes/matrix-green-blue/`, etc.
- **Service File**: `/etc/systemd/system/web-wallpaper-api.service`
- **Logs**: `sudo journalctl -u web-wallpaper-api`

**Development (Git repo):**
- **Source**: `theme/base/background.html`
- **Config**: `theme/base/config.json`
- **API Source**: `src/app.py`
- **Build Script**: `build.sh`

## Troubleshooting

**Stats show "RANDOMIZED":**
- Test API health: `curl http://localhost:5000/api/health`
- Test API stats: `curl http://localhost:5000/api/stats`
- Check service: `sudo systemctl status web-wallpaper-api`
- Check logs: `sudo journalctl -u web-wallpaper-api -n 50`
- Verify apiBase in config.json is set to `http://localhost:5000`
- If using file:// protocol, CORS must be enabled (it is in the API)

**Service won't start:**
- Check logs: `sudo journalctl -u web-wallpaper-api -n 50`
- Verify Python venv: `ls .venv/`
- Re-run installer: `sudo ./install.sh`

**Theme not loading:**
- Check theme folder exists: `ls theme/your-theme-name/`
- Verify theme.json syntax
- Check browser console for errors
