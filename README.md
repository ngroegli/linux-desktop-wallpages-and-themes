# web-desktop-wallpapers

A configurable web-based desktop wallpaper system with live system metrics, multiple themes, and a Flask API backend. Designed for use with Hidamari and similar wallpaper engines.

## Features

- **Live System Metrics**: CPU, RAM, Disk, and Network usage via Flask API
- **12 Animated Themes**: Cyberpunk, Synthwave, Cybersecurity, Space, and more
- **Canvas Animations**: Unique background effects per theme
- **Auto-fallback**: Randomized stats when API is unreachable
- **Config-driven**: Theme and settings in `config.json`
- **Systemd Service**: Auto-start Flask API on system boot
- **OpenBar Integration**: GNOME Shell color matching
- **Single-file Builds**: Portable HTML wallpapers for Hidamari

## Quick Start

1. **Install the Flask API service and themes** (requires sudo):
   ```bash
   sudo ./install.sh
   ```
   This installs:
   - Flask API as systemd service
   - Themes to `~/DesktopBackgrounds/`
   - Single-file wallpapers for Hidamari

2. **Use the wallpaper:**
   - **Hidamari**: `~/DesktopBackgrounds/wallpaper-<theme>.html`
   - **Browser**: `~/DesktopBackgrounds/_base/background.html`

3. **Configure** (optional) in `~/DesktopBackgrounds/config/config.json`:
   ```json
   {
     "theme": "ice-blue",
     "image": "",
     "showImage": false,
     "title": "My Desktop",
     "showTitle": false,
     "apiBase": "http://localhost:5000"
   }
   ```

   Then rebuild: `./build.sh ~/DesktopBackgrounds`

## Available Themes

**Cybersecurity & Tech:**
- `matrix-green-blue` - Cyberpunk matrix rain animation
- `threat-map` - Global threat intelligence with rotating globe
- `soc-blueprint` - SOC dashboard with live metrics
- `cyber-fortress` - Hexagonal defense shields
- `circuit-board` - Animated circuit paths

**Artistic & Visual:**
- `synth-grid` - 80s synthwave retrowave aesthetic
- `sunset-equalizer` - Audio equalizer visualization
- `clair-obscur` - Art Deco golden geometry
- `ice-blue` - Arctic icebergs with aurora

**Space & Sci-Fi:**
- `ascii-galaxy` - ASCII art star field
- `quantum-tunnel` - Quantum portal rings

**Branded:**
- `ubuntu` - Ubuntu Circle of Friends logo

## Documentation

### 🚀 Getting Started
- **[Quick Start Guide](docs/getting-started/quickstart.md)** - 5-minute setup
- **[Installation Guide](docs/getting-started/installation.md)** - Detailed installation
- **[Usage Guide](docs/getting-started/usage.md)** - Configuration and usage

### 🏗️ Architecture
- **[System Architecture](docs/architecture/overview.md)** - Complete technical architecture
- **[Architecture Diagrams](docs/architecture/diagrams/)** - Visual system diagrams

### 💻 Development
- **[Flask API Reference](docs/development/api.md)** - REST API documentation
- **[Theme Development](docs/development/themes.md)** - Creating custom themes
- **[Hidamari Integration](docs/development/hidamari.md)** - Wallpaper engine setup

📚 **[Full Documentation](docs/)** - Complete documentation index

## Project Structure

```
.
├── theme/
│   ├── _base/             # Base template files (underscore for sorting)
│   ├── config/            # Configuration files
│   ├── matrix-green-blue/ # 12 animated themes
│   ├── ice-blue/          # Each with theme.json + background.js
│   ├── ubuntu/            # + openbar-theme-config for shell colors
│   └── [9 more themes]/
├── src/                   # Flask API backend
│   ├── app.py
│   └── utils/
├── docs/                  # Documentation
│   ├── getting-started/   # User guides
│   ├── architecture/      # System design
│   └── development/       # Developer guides
├── build.sh               # Single-file compiler
├── install.sh             # Service installer
├── web-wallpaper-api.service
└── requirements.txt
```

## Development

Run Flask API locally without installing as service:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/app.py
```

Or with Docker:

```bash
docker compose up --build
```

## API Endpoints

- `GET /api/stats` - **All system stats in one call** (recommended)
- `GET /api/health` - Health check
- `GET /api/cpu` - CPU usage and core count
- `GET /api/ram` - RAM usage and totals
- `GET /api/disk` - Disk usage and space
- `GET /api/network` - Network I/O statistics

## License

See [LICENSE](LICENSE) file.
