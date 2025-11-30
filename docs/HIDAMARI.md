# Hidamari (for wallpapers)

This repository integrates with Hidamari for web-based wallpaper management. Place themes and wallpaper metadata in the `theme/` folder.

Hidamari-specific notes:
- Hidamari expects theme JSON and images. Use `theme/example_theme.json` as a starting point.
- The Flask API provides system information which the Hidamari-powered UI can poll to show system overlays or adapt wallpapers based on system state.

See `docs/ARCHITECTURE.md` for how the pieces fit together.