#!/usr/bin/env bash
set -e

# Build script to compile multi-file wallpaper into single HTML files for Hidamari
# This script combines HTML, CSS, JS, and config into standalone files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$(pwd)"
TARGET_DIR="$SOURCE_DIR/compiled"

# Create compiled output directory if it doesn't exist
mkdir -p "$TARGET_DIR"

if [ ! -d "$SOURCE_DIR/base" ]; then
    echo "ERROR: Current directory must contain base/ folder"
    echo "Current directory: $SOURCE_DIR"
    echo "Please run this script from a directory containing theme files (base/, config/, theme folders)"
    exit 1
fi

echo "==> Building single-file wallpapers for Hidamari"
echo "    Source: $SOURCE_DIR"
echo "    Output: $TARGET_DIR"

# Read config.json to get available themes
CONFIG_FILE="$SOURCE_DIR/config/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ERROR: config.json not found at $CONFIG_FILE"
    exit 1
fi

# Get list of theme directories
THEMES=()
THEMES_SOURCE_DIR="$SOURCE_DIR/themes"
if [ ! -d "$THEMES_SOURCE_DIR" ]; then
    echo "ERROR: themes/ directory not found"
    exit 1
fi

for theme_dir in "$THEMES_SOURCE_DIR"/*/ ; do
    if [ -d "$theme_dir" ]; then
        theme_name=$(basename "$theme_dir")
        if [ -f "$theme_dir/theme.json" ]; then
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
    local html_file="$SOURCE_DIR/base/background.html"
    local css_file="$SOURCE_DIR/base/template.css"
    local js_template="$SOURCE_DIR/base/template.js"
    local js_bg_manager="$SOURCE_DIR/base/background-manager.js"

    # Read theme files
    local theme_json="$SOURCE_DIR/themes/$theme_name/theme.json"
    local theme_bg_js=""
    if [ -f "$SOURCE_DIR/themes/$theme_name/background.js" ]; then
        theme_bg_js="$SOURCE_DIR/themes/$theme_name/background.js"
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

    # Start building the output file by reading and modifying the base HTML
    # Read the HTML and split into head and body sections
    local html_head=$(sed -n '1,/<\/head>/p' "$html_file")
    local html_body=$(sed -n '/<body/,/<\/body>/p' "$html_file")

    # Start output file with HTML structure up to </title>
    echo "<!doctype html>" > "$output_file"
    echo "<html lang=\"en\">" >> "$output_file"
    echo "<head>" >> "$output_file"
    echo "  <meta charset=\"utf-8\" />" >> "$output_file"
    echo "  <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />" >> "$output_file"
    echo "  <title>Wallpaper - $theme_name</title>" >> "$output_file"

    # Embed CSS instead of linking
    echo "  <style>" >> "$output_file"
    cat "$css_file" >> "$output_file"
    echo "  </style>" >> "$output_file"
    echo "</head>" >> "$output_file"

    # Add body content (excluding script tags)
    echo "$html_body" | sed '/<script src=/d' >> "$output_file"

    # Now add embedded scripts
    cat >> "$output_file" << 'EOF'
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
