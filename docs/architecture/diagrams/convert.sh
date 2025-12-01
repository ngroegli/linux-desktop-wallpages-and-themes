#!/usr/bin/env bash
set -e

# Script to convert D2 diagrams to PNG images
# Requires: d2 (https://d2lang.com)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRAWINGS_DIR="$SCRIPT_DIR"

echo "==> Converting D2 diagrams to PNG"

# Check if d2 is installed
if ! command -v d2 &> /dev/null; then
    echo "ERROR: d2 is not installed"
    echo "Install it from: https://d2lang.com/tour/install"
    echo ""
    echo "Quick install:"
    echo "  curl -fsSL https://d2lang.com/install.sh | sh -s --"
    exit 1
fi

# Convert each .d2 file to PNG
for d2_file in "$DRAWINGS_DIR"/*.d2; do
    if [ -f "$d2_file" ]; then
        filename=$(basename "$d2_file" .d2)
        png_file="$DRAWINGS_DIR/${filename}.png"

        echo "Converting: $filename.d2 -> $filename.png"
        d2 --theme=200 --pad=20 "$d2_file" "$png_file"
    fi
done

echo ""
echo "==> Conversion complete!"
echo "Generated PNG files in: $DRAWINGS_DIR"
