# Installation Guide

This guide explains how to install the Web Wallpaper API as a systemd service that starts automatically on system boot.

## Prerequisites

- Linux system with systemd (Ubuntu, Debian, Fedora, etc.)
- Python 3.8 or higher
- sudo/root access

## Quick Install

1. Clone or download this repository
2. Navigate to the repository root
3. Run the installer with sudo:

```bash
sudo ./install.sh
```

The installer will:
- Create a Python virtual environment at `.venv`
- Install dependencies from `requirements.txt`
- Create a systemd service file at `/etc/systemd/system/web-wallpaper-api.service`
- Enable the service to start on boot
- Start the service immediately

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

## Configuration

After installation, configure the wallpaper frontend in `theme/base/config.json`:

```json
{
  "theme": "ice-blue",
  "image": "",
  "title": "Your Title Here",
  "apiBase": "http://localhost:5000",
  "backgroundMode": "none"
}
```

Options:
- **theme**: Theme folder name (`matrix-green-blue`, `ice-blue`, `ubuntu`)
- **image**: URL or path to center image (empty = no image)
- **title**: Center title text
- **apiBase**: Flask API URL (default: `http://localhost:5000`)
- **backgroundMode**: Background effect (`none`, `matrix`)

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
