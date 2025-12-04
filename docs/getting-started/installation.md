# Installation Guide

This guide explains how to install the Linux Desktop Wallpapers & Themes with the optional Web Wallpaper API service.

## Prerequisites

- Linux system with systemd (Ubuntu, Debian, Fedora, etc.)
- Python 3.8 or higher
- sudo/root access

## Installation Methods

### From GitHub Release (Recommended)

1. **Download the latest release:**
```bash
VERSION="v1.0.0"  # Check https://github.com/ngroegli/linux-desktop-wallpages-and-themes/releases for latest
wget https://github.com/ngroegli/linux-desktop-wallpages-and-themes/releases/download/${VERSION}/wallpapers-${VERSION}.tar.gz
tar -xzf wallpapers-${VERSION}.tar.gz
cd linux-desktop-wallpapers
```

2. **Run the installer:**
```bash
sudo ./install.sh
```

### From Git Repository

1. **Clone the repository:**
```bash
git clone https://github.com/ngroegli/linux-desktop-wallpages-and-themes.git
cd linux-desktop-wallpages-and-themes
```

2. **Run the installer:**
```bash
sudo ./install.sh
```

## What the Installer Does

The `install.sh` script automatically:
- ✅ Creates a Python virtual environment (`.venv`)
- ✅ Installs Python dependencies from `requirements.txt`
- ✅ Installs the systemd service (`web-wallpaper-api.service`)
- ✅ Enables the API service to start on boot
- ✅ Starts the API service immediately
- ✅ Copies themes to `~/WallpagesThemes/`
- ✅ Copies `build.sh` for custom theme compilation

## Verify Installation

Check service status:
```bash
sudo systemctl status web-wallpaper-api
```

Test the API:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status": "ok"}
```

## Service Management Commands

```bash
# Check status
sudo systemctl status web-wallpaper-api

# Stop service
sudo systemctl stop web-wallpaper-api

# Start service
sudo systemctl start web-wallpaper-api

# Restart service
sudo systemctl restart web-wallpaper-api

# Disable autostart on boot
sudo systemctl disable web-wallpaper-api

# Re-enable autostart
sudo systemctl enable web-wallpaper-api

# View logs
sudo journalctl -u web-wallpaper-api -f

# View last 50 log lines
sudo journalctl -u web-wallpaper-api -n 50
```

## Post-Installation Steps

### 1. Configure Themes (Optional)

Edit the theme configuration at `~/WallpagesThemes/config/config.json`:

```json
{
  "theme": "ice-blue",
  "title": "Your Title Here",
  "showTitle": false,
  "apiBase": "http://localhost:5000"
}
```

Options:
- **theme**: Theme folder name (see available themes below)
- **title**: Center title text
- **showTitle**: Display title on wallpaper (`true` or `false`)
- **apiBase**: Flask API URL (default: `http://localhost:5000`)

### 2. Build Single-File Wallpapers (For Hidamari)

If you want to use the wallpapers with Hidamari, build the single-file versions:

```bash
cd ~/WallpagesThemes
./build.sh
```

This creates compiled wallpapers in `~/WallpagesThemes/compiled/wallpaper-<theme>.html`

### 3. Use the Wallpapers

**For Browser (dynamic, needs API):**
```bash
xdg-open ~/WallpagesThemes/base/background.html
```

**For Hidamari (standalone):**
Use the compiled files: `~/WallpagesThemes/compiled/wallpaper-<theme>.html`

## Optional Integrations

### Hidamari (Animated Desktop Wallpaper)

For using the compiled HTML wallpapers as your desktop background, you can use [Hidamari](https://github.com/jeffshee/hidamari).

After installing Hidamari (see their installation guide), you can set the compiled wallpapers from:
```
~/WallpagesThemes/compiled/wallpaper-<theme>.html
```

### GNOME OpenBar Extension (Matching Panel Theme)

If you use GNOME and the [OpenBar extension](https://extensions.gnome.org/extension/6580/open-bar/), you can import matching theme configurations.

Each theme includes an `openbar-theme-config` file that you can import in OpenBar settings:
```
~/WallpagesThemes/themes/<theme-name>/openbar-theme-config
```

This will match your panel colors to your wallpaper theme for a cohesive desktop appearance

## API Endpoints

Once running, the API exposes:

- `GET /api/health` - Health check
- `GET /api/cpu` - CPU usage and details
- `GET /api/ram` - RAM usage
- `GET /api/disk` - Disk usage
- `GET /api/network` - Network I/O statistics

## Uninstalling

To remove the service:

```bash
sudo systemctl stop web-wallpaper-api
sudo systemctl disable web-wallpaper-api
sudo rm /etc/systemd/system/web-wallpaper-api.service
sudo systemctl daemon-reload
```

Then optionally remove the repository directory.

## Troubleshooting

**Service fails to start:**
- Check logs: `sudo journalctl -u web-wallpaper-api -n 50`
- Verify Python dependencies: `source .venv/bin/activate && pip list`
- Check port 5000 is not in use: `sudo lsof -i :5000`

**API returns errors:**
- Verify psutil is installed: `.venv/bin/pip show psutil`
- Check file permissions in `src/` directory
- Restart service: `sudo systemctl restart web-wallpaper-api`

**Frontend shows "RANDOMIZED" status:**
- Verify API is running: `curl http://localhost:5000/api/health`
- Check `apiBase` in `theme/base/config.json` matches the API URL
- Check browser console for CORS or network errors
