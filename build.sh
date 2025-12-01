#!/usr/bin/env bash
set -e

# Build script to compile multi-file wallpaper into single HTML files for Hidamari
# This script combines HTML, CSS, JS, and config into standalone files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$SCRIPT_DIR/theme}"

if [ ! -d "$TARGET_DIR/_base" ]; then
    echo "ERROR: Target directory must contain _base/ folder"
    echo "Usage: $0 <target_directory>"
    exit 1
fi

echo "==> Building single-file wallpapers for Hidamari"
echo "    Source: $TARGET_DIR"

# Read config.json to get available themes
CONFIG_FILE="$TARGET_DIR/config/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: config.json not found at $CONFIG_FILE"
    exit 1
fi

# Get list of theme directories
THEMES=()
for theme_dir in "$TARGET_DIR"/*/ ; do
    if [ -d "$theme_dir" ]; then
        theme_name=$(basename "$theme_dir")
        if [ "$theme_name" != "_base" ] && [ "$theme_name" != "config" ] && [ -f "$theme_dir/theme.json" ]; then
            THEMES+=("$theme_name")
        fi
    fi
done

echo "    Found themes: ${THEMES[*]}"

# Function to escape content for embedding in JavaScript
escape_for_js() {
    # Escape backslashes, quotes, newlines, and other special chars
    sed 's/\\/\\\\/g; s/"/\\"/g; s/`/\\`/g' | awk '{printf "%s\\n", $0}' | sed '$ s/\\n$//'
}

# Function to build a single HTML file for a theme
build_theme() {
    local theme_name="$1"
    local output_file="$TARGET_DIR/wallpaper-${theme_name}.html"

    echo "    Building: wallpaper-${theme_name}.html"

    # Read base files
    local html_file="$TARGET_DIR/_base/background.html"
    local css_file="$TARGET_DIR/_base/template.css"
    local js_template="$TARGET_DIR/_base/template.js"
    local js_bg_manager="$TARGET_DIR/_base/background-manager.js"

    # Read theme files
    local theme_json="$TARGET_DIR/$theme_name/theme.json"
    local theme_bg_js=""
    if [ -f "$TARGET_DIR/$theme_name/background.js" ]; then
        theme_bg_js="$TARGET_DIR/$theme_name/background.js"
    fi

    # Check if all required files exist
    if [ ! -f "$html_file" ] || [ ! -f "$css_file" ] || [ ! -f "$js_template" ]; then
        echo "    ERROR: Missing base files for $theme_name"
        return 1
    fi

    if [ ! -f "$theme_json" ]; then
        echo "    ERROR: Missing theme.json for $theme_name"
        return 1
    fi

    # Start building the output file
    cat > "$output_file" << 'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Wallpaper - EOF
    echo -n "$theme_name" >> "$output_file"
    cat >> "$output_file" << 'EOF'
</title>
  <style>
EOF

    # Embed CSS
    cat "$css_file" >> "$output_file"

    cat >> "$output_file" << 'EOF'
  </style>
</head>
<body class="template-root">

  <!-- Top-left clock -->
  <div class="top-clock">
    <div class="top-clock-time" id="top-clock-time">00:00:00</div>
    <div class="top-clock-date" id="top-clock-date">LOADING...</div>
  </div>

  <!-- Right-side info panels -->
  <div class="right-panel">
    <div class="panel-section">
      <div class="panel-title"><span class="status-indicator"></span>CPU</div>
      <div class="stat-row"><span class="stat-label">STATUS</span><span class="stat-value" id="cpu-status">ONLINE</span></div>
      <div class="stat-row"><span class="stat-label">USAGE</span><span class="stat-value" id="cpu-value">0%</span></div>
      <div class="progress-bar"><div class="progress-fill" id="cpu-bar" style="width:0%"></div></div>
      <div class="stat-row"><span class="stat-label">CORES</span><span class="stat-value" id="cpu-cores">0</span></div>
      <div class="stat-row"><span class="stat-label">FREQ</span><span class="stat-value" id="cpu-freq">0 MHz</span></div>
    </div>

    <div class="panel-section">
      <div class="panel-title"><span class="status-indicator"></span>RAM</div>
      <div class="stat-row"><span class="stat-label">STATUS</span><span class="stat-value" id="ram-status">ONLINE</span></div>
      <div class="stat-row"><span class="stat-label">USAGE</span><span class="stat-value" id="ram-value">0%</span></div>
      <div class="progress-bar"><div class="progress-fill" id="ram-bar" style="width:0%"></div></div>
      <div class="stat-row"><span class="stat-label">TOTAL</span><span class="stat-value" id="ram-total">0 GB</span></div>
      <div class="stat-row"><span class="stat-label">USED</span><span class="stat-value" id="ram-used">0 GB</span></div>
    </div>

    <div class="panel-section">
      <div class="panel-title"><span class="status-indicator"></span>DISK</div>
      <div class="stat-row"><span class="stat-label">STATUS</span><span class="stat-value" id="disk-status">ONLINE</span></div>
      <div class="stat-row"><span class="stat-label">USAGE</span><span class="stat-value" id="disk-percent">0%</span></div>
      <div class="progress-bar"><div class="progress-fill" id="disk-bar" style="width:0%"></div></div>
      <div class="stat-row"><span class="stat-label">TOTAL</span><span class="stat-value" id="disk-total">0 GB</span></div>
      <div class="stat-row"><span class="stat-label">FREE</span><span class="stat-value" id="disk-free">0 GB</span></div>
    </div>

    <div class="panel-section">
      <div class="panel-title"><span class="status-indicator"></span>NETWORK</div>
      <div class="stat-row"><span class="stat-label">STATUS</span><span class="stat-value" id="net-status">ONLINE</span></div>
      <div class="stat-row"><span class="stat-label">LATENCY</span><span class="stat-value" id="latency-value">0ms</span></div>
      <div class="stat-row"><span class="stat-label">SENT</span><span class="stat-value" id="net-sent">0 B</span></div>
      <div class="stat-row"><span class="stat-label">RECV</span><span class="stat-value" id="net-recv">0 B</span></div>
    </div>
  </div>

  <!-- Center title -->
  <main class="center-stage" id="center-stage">
    <h1 class="center-title" id="center-title" style="display:none;"></h1>
  </main>

  <div class="decor-overlay" aria-hidden="true"></div>

  <!-- Background layer: canvas for animated backgrounds -->
  <canvas id="background-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;"></canvas>

  <script>
// Embedded configuration
const EMBEDDED_CONFIG =
EOF

    # Embed config with theme override
    cat "$CONFIG_FILE" | jq --arg theme "$theme_name" '. + {theme: $theme}' >> "$output_file"

    cat >> "$output_file" << 'EOF'
;

// Embedded theme configuration
const EMBEDDED_THEME =
EOF

    # Embed theme.json
    cat "$theme_json" >> "$output_file"

    cat >> "$output_file" << 'EOF'
;

// Template.js (modified for embedded mode)
EOF

    # Embed template.js with modifications
    cat "$js_template" | sed 's/await fetch(base + "\/config\.json")/Promise.resolve({json: () => EMBEDDED_CONFIG})/g' | \
                         sed 's/await fetch(themePath)/Promise.resolve({ok: true, json: () => EMBEDDED_THEME})/g' \
                         >> "$output_file"

    cat >> "$output_file" << 'EOF'

// Background manager (modified for embedded mode)
EOF

    # Embed background-manager.js
    cat "$js_bg_manager" >> "$output_file"

    # Embed theme background script if it exists
    if [ -n "$theme_bg_js" ] && [ -f "$theme_bg_js" ]; then
        cat >> "$output_file" << 'EOF'

// Theme-specific background script
EOF
        cat "$theme_bg_js" >> "$output_file"
    fi

    cat >> "$output_file" << 'EOF'

// Initialize with embedded config
(async function() {
    // Override loadConfig to use embedded config
    const originalLoadConfig = window.WALLPAPER_TEMPLATE.loadConfig;
    window.WALLPAPER_TEMPLATE.loadConfig = async function() {
        const cfg = EMBEDDED_CONFIG;

        // Apply theme
        if(cfg.theme){
            if(typeof cfg.theme === 'string') {
                // Apply embedded theme directly
                window.WALLPAPER_TEMPLATE.applyTheme(EMBEDDED_THEME, cfg.theme);

                // Start background animation if theme has backgroundMode and THEME_BACKGROUND is defined
                if(EMBEDDED_THEME.backgroundMode && window.THEME_BACKGROUND && window.THEME_BACKGROUND.start) {
                    const canvas = document.getElementById('background-canvas');
                    if(canvas) {
                        window.THEME_BACKGROUND.start(canvas, EMBEDDED_THEME.backgroundMode);
                    }
                }
            } else {
                window.WALLPAPER_TEMPLATE.applyTheme(cfg.theme);
            }
        }

        // Apply title (respect showTitle setting, default to false)
        const showTitle = cfg.showTitle !== undefined ? cfg.showTitle : false;
        if(showTitle && cfg.title) {
            window.WALLPAPER_TEMPLATE.setTitle(cfg.title, true);
        } else {
            window.WALLPAPER_TEMPLATE.setTitle('', false);
        }

        // Set API base
        if(cfg.apiBase) window.API_BASE = cfg.apiBase;

        return cfg;
    };

    // Initialize
    await window.WALLPAPER_TEMPLATE.loadConfig();
})();
  </script>
</body>
</html>
EOF

    echo "    Created: $output_file"
}

# Build for each theme
for theme in "${THEMES[@]}"; do
    build_theme "$theme"
done

echo ""
echo "==> Build complete!"
echo "    Generated ${#THEMES[@]} single-file wallpaper(s)"
echo ""
echo "Files created:"
for theme in "${THEMES[@]}"; do
    echo "  - wallpaper-${theme}.html"
done
echo ""
echo "Use these files with Hidamari or any web browser."
