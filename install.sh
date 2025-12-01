#!/usr/bin/env bash
set -e

# Installer script for web-wallpaper Flask API service
# This installs the API as a systemd service that starts on system boot.

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_USER="${SUDO_USER:-$USER}"
SERVICE_NAME="web-wallpaper-api"

echo "==> Installing Web Wallpaper API Service"
echo "    Repository: $REPO_DIR"
echo "    User: $INSTALL_USER"

# Check if running with sudo (required for systemd install)
if [[ $EUID -ne 0 ]]; then
   echo "ERROR: This script must be run with sudo"
   echo "Usage: sudo ./install.sh"
   exit 1
fi

# Install Python dependencies in .venv if not present
if [ ! -d "$REPO_DIR/.venv" ]; then
    echo "==> Creating Python virtual environment at $REPO_DIR/.venv"
    sudo -u "$INSTALL_USER" python3 -m venv "$REPO_DIR/.venv"
fi

echo "==> Installing Python dependencies"
sudo -u "$INSTALL_USER" "$REPO_DIR/.venv/bin/pip" install -q --upgrade pip
sudo -u "$INSTALL_USER" "$REPO_DIR/.venv/bin/pip" install -q -r "$REPO_DIR/requirements.txt"

# Create systemd service file
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
echo "==> Creating systemd service file at $SERVICE_FILE"

cat "$REPO_DIR/web-wallpaper-api.service" \
    | sed "s|%INSTALL_USER%|$INSTALL_USER|g" \
    | sed "s|%INSTALL_DIR%|$REPO_DIR|g" \
    > "$SERVICE_FILE"

# Set correct working directory to src/
sed -i "s|WorkingDirectory=.*|WorkingDirectory=$REPO_DIR/src|g" "$SERVICE_FILE"

# Reload systemd, enable and start the service
echo "==> Reloading systemd daemon"
systemctl daemon-reload

echo "==> Enabling ${SERVICE_NAME}.service to start on boot"
systemctl enable "${SERVICE_NAME}.service"

echo "==> Starting ${SERVICE_NAME}.service"
systemctl start "${SERVICE_NAME}.service"

# Check status
echo ""
echo "==> Installation complete!"
echo ""
systemctl status "${SERVICE_NAME}.service" --no-pager || true

echo ""
echo "Service management commands:"
echo "  sudo systemctl status ${SERVICE_NAME}   # Check service status"
echo "  sudo systemctl stop ${SERVICE_NAME}     # Stop service"
echo "  sudo systemctl restart ${SERVICE_NAME}  # Restart service"
echo "  sudo systemctl disable ${SERVICE_NAME}  # Disable autostart"
echo "  sudo journalctl -u ${SERVICE_NAME} -f  # View logs"
echo ""
echo "API should be available at: http://localhost:5000/api/health"
echo ""

# Install themes to user profile
USER_HOME=$(eval echo ~$INSTALL_USER)
THEMES_DIR="$USER_HOME/DesktopBackgrounds"

echo "==> Installing themes to user profile"
echo "    Target directory: $THEMES_DIR"

# Create or clean DesktopBackgrounds directory
echo "    Creating directory structure..."
sudo -u "$INSTALL_USER" mkdir -p "$THEMES_DIR"

# Copy theme directory with all subdirectories (overwrite existing)
echo "    Copying theme files (overwriting existing)..."
sudo -u "$INSTALL_USER" cp -rf "$REPO_DIR/theme/"* "$THEMES_DIR/"

# Remove source README.md from themes directory (will be in docs only)
if [ -f "$THEMES_DIR/README.md" ]; then
    rm -f "$THEMES_DIR/README.md"
fi

# Copy installation README
if [ -f "$REPO_DIR/theme/INSTALL_README.md" ]; then
    sudo -u "$INSTALL_USER" cp "$REPO_DIR/theme/INSTALL_README.md" "$THEMES_DIR/README.md"
fi

# Copy build script to user directory
echo "    Copying build script..."
if [ -f "$REPO_DIR/build.sh" ]; then
    sudo -u "$INSTALL_USER" cp "$REPO_DIR/build.sh" "$THEMES_DIR/build.sh"
    sudo -u "$INSTALL_USER" chmod +x "$THEMES_DIR/build.sh"
    echo "    Build script installed: $THEMES_DIR/build.sh"
fi

# Create asset folders for each theme
echo "    Creating asset folders for themes..."
for theme_dir in "$THEMES_DIR"/*/ ; do
    if [ -d "$theme_dir" ]; then
        theme_name=$(basename "$theme_dir")
        # Skip _base and config directories
        if [ "$theme_name" != "_base" ] && [ "$theme_name" != "config" ]; then
            asset_dir="$theme_dir/assets"
            if [ ! -d "$asset_dir" ]; then
                sudo -u "$INSTALL_USER" mkdir -p "$asset_dir"
                echo "    Created: $theme_name/assets/"
            fi
        fi
    fi
done

echo "    Setting permissions..."
sudo -u "$INSTALL_USER" chmod -R u+rwX,go+rX "$THEMES_DIR"

echo ""
echo "==> Theme installation complete!"
echo "    Themes installed to: $THEMES_DIR"
echo "    Asset folders created in each theme directory"
echo "    Build script installed: $THEMES_DIR/build.sh"
echo ""
echo "Next steps:"
echo "  1. Edit configuration (optional): $THEMES_DIR/config/config.json"
echo "  2. Build single-file wallpapers: cd $THEMES_DIR && ./build.sh ."
echo ""
echo "Usage:"
echo "  Browser:  file://$THEMES_DIR/_base/background.html"
echo "  Hidamari: file://$THEMES_DIR/wallpaper-<theme>.html (after building)"
echo ""
