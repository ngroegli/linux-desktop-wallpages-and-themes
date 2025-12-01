# Documentation# Documentation



Complete documentation for the Web Desktop Wallpaper system.This folder holds comprehensive project documentation.



## Quick Navigation## Quick Reference



### 🚀 Getting Started- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup and usage reference for new users

New to the project? Start here:- **[SOFTWARE_ARCHITECTURE.md](SOFTWARE_ARCHITECTURE.md)** - Complete software architecture documentation with diagrams

- **[Quickstart Guide](getting-started/quickstart.md)** - 5-minute setup

- **[Installation Guide](getting-started/installation.md)** - Detailed installation and systemd setup## Setup & Installation

- **[Usage Guide](getting-started/usage.md)** - Basic usage and configuration

- **[INSTALLATION.md](INSTALLATION.md)** - Service setup and systemd configuration

### 🏗️ Architecture- **[HIDAMARI.md](HIDAMARI.md)** - Notes for using Hidamari wallpaper engine

Understand how the system works:

- **[System Architecture](architecture/overview.md)** - Complete technical architecture## Theming & Customization

- **[Architecture Diagrams](architecture/diagrams/)** - Visual system diagrams (D2 format)

- **[THEME_STRUCTURE.md](THEME_STRUCTURE.md)** - Theme folder organization and required files

### 💻 Development- **[THEME_TEMPLATE.md](THEME_TEMPLATE.md)** - Creating and customizing themes

Contributing or customizing:

- **[Flask API Reference](development/api.md)** - REST API documentation## Technical Reference

- **[Theme Development Guide](development/themes.md)** - Creating and customizing themes

- **[Hidamari Integration](development/hidamari.md)** - Wallpaper engine integration- **[FLASK_API.md](FLASK_API.md)** - REST API endpoints and examples

- **[FLASK_API_NOTES.md](FLASK_API_NOTES.md)** - Additional API implementation notes

## Documentation Structure- **[ARCHITECTURE.md](ARCHITECTURE.md)** - High-level project structure

- **[USAGE.md](USAGE.md)** - How to run locally and with Docker

```

docs/## Diagrams

├── README.md                      # This file

│- **[drawings/](drawings/)** - D2 architecture diagrams and PNG exports

├── getting-started/               # User guides  - `system-architecture.d2/.png` - Complete system overview

│   ├── quickstart.md              # Quick setup  - `communication-flow.d2/.png` - Frontend-backend communication

│   ├── installation.md            # Full installation  - `convert.sh` - Script to convert D2 to PNG

│   └── usage.md                   # Usage instructions  - See [drawings/README.md](drawings/README.md) for details

│

├── architecture/                  # System design
│   ├── overview.md                # Complete architecture
│   └── diagrams/                  # Visual diagrams
│       ├── system-architecture.*  # Component overview
│       ├── communication-flow.*   # Data flow
│       ├── convert.sh             # Diagram generator
│       └── README.md              # Diagram docs
│
└── development/                   # Developer docs
    ├── api.md                     # API reference
    ├── themes.md                  # Theme guide
    └── hidamari.md                # Hidamari integration
```

## Feature Overview

### System Components
- **Live Metrics**: Real-time CPU, RAM, Disk, Network stats
- **12 Themes**: Cyberpunk, Arctic, Ubuntu, Synthwave, and more
- **Animations**: Canvas-based background effects per theme
- **Flask API**: Python backend for system metrics
- **systemd Service**: Auto-start on boot
- **Hidamari Support**: Single-file wallpaper deployment
- **OpenBar Integration**: GNOME Shell color matching

### Available Themes
1. **matrix-green-blue** - Cyberpunk matrix rain
2. **ice-blue** - Arctic icebergs with aurora
3. **ubuntu** - Ubuntu Circle of Friends
4. **clair-obscur** - Art Deco golden geometry
5. **sunset-equalizer** - Audio equalizer visualization
6. **synth-grid** - 80s synthwave retrowave
7. **ascii-galaxy** - ASCII art space theme
8. **circuit-board** - Animated circuit paths
9. **quantum-tunnel** - Quantum portal rings
10. **cyber-fortress** - Hexagonal defense shields
11. **threat-map** - Global threat intelligence
12. **soc-blueprint** - SOC dashboard metrics

## Quick Reference

### Installation
```bash
# Install Flask API and themes
sudo ./install.sh

# Themes installed to:
~/WallpagesThemes/
```

### Configuration
Edit `~/WallpagesThemes/config/config.json`:
```json
{
  "theme": "matrix-green-blue",
  "title": "My Desktop",
  "showTitle": false,
  "apiBase": "http://localhost:5000"
}
```

### API Endpoints
```bash
# All metrics (recommended)
curl http://localhost:5000/api/stats

# Individual metrics
curl http://localhost:5000/api/cpu
curl http://localhost:5000/api/ram
curl http://localhost:5000/api/disk
curl http://localhost:5000/api/network
```

### Service Management
```bash
# Control Flask API service
sudo systemctl start web-wallpaper-api
sudo systemctl stop web-wallpaper-api
sudo systemctl restart web-wallpaper-api
sudo systemctl status web-wallpaper-api

# View logs
sudo journalctl -u web-wallpaper-api -f
```

### Building Wallpapers
```bash
# Build single-file wallpapers
./build.sh

# Output: ./output/wallpaper-<theme>.html for each theme
```

## Learning Path

### For End Users
1. Start with [Quickstart Guide](getting-started/quickstart.md)
2. Read [Installation Guide](getting-started/installation.md) for full setup
3. Review [Usage Guide](getting-started/usage.md) for configuration

### For Theme Creators
1. Understand [System Architecture](architecture/overview.md)
2. Study [Theme Development Guide](development/themes.md)
3. Explore existing themes in `theme/` directory
4. Review [Architecture Diagrams](architecture/diagrams/) for context

### For Developers
1. Review [System Architecture](architecture/overview.md)
2. Study [Flask API Reference](development/api.md)
3. Read [Theme Development Guide](development/themes.md)
4. Check [Hidamari Integration](development/hidamari.md)

## Project Links

- **Repository**: [GitHub](https://github.com/ngroegli/web-desktop-wallpapers)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/ngroegli/web-desktop-wallpapers/issues)
- **License**: See [LICENSE](../LICENSE)

## Getting Help

### Documentation
- Read through this documentation
- Check [Architecture](architecture/overview.md) for design details
- Review [API docs](development/api.md) for backend details

### Common Issues
- **API not responding**: Check systemd service status
- **Theme not loading**: Verify theme name in config.json
- **Animation not working**: Check browser console for errors
- **Build fails**: Ensure bash, jq, and sed are installed

### Support
- Open an issue on GitHub
- Include system info (OS, browser, Python version)
- Attach relevant logs from journalctl

## Contributing

Contributions welcome! Areas to contribute:
- **New Themes**: Create stunning wallpaper themes
- **Documentation**: Improve or translate docs
- **Bug Fixes**: Fix issues and improve stability
- **Features**: Add new metrics or capabilities

See individual development docs for detailed guidelines.

## Version History

- **v2.0** - 12 themes, OpenBar integration, reorganized docs
- **v1.5** - Cybersecurity themes (threat-map, soc-blueprint, etc.)
- **v1.0** - Initial release with matrix, ice-blue, ubuntu themes

---

**Last Updated**: December 2025
**Maintained By**: Nicolas Groegli
