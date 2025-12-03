# Theme Development Guide

Complete guide to creating and customizing wallpaper themes.

## Table of Contents
- [Theme Structure](#theme-structure)
- [Available Themes](#available-themes)
- [Creating a New Theme](#creating-a-new-theme)
- [Theme Configuration](#theme-configuration)
- [Background Animations](#background-animations)
- [OpenBar Integration](#openbar-integration)

## Theme Structure

### Directory Layout

```
theme/
├── base/                      # Shared wallpaper templates
│   ├── background.html        # Main HTML template
│   ├── template.css           # Base styles
│   ├── template.js            # Core wallpaper logic
│   └── background-manager.js  # Background animation loader
│
├── config/                    # Configuration
│   └── config.json            # Global wallpaper settings
│
├── matrix-green-blue/         # Example theme
│   ├── theme.json             # Theme colors and settings
│   ├── background.js          # Custom background animation
│   └── openbar-theme-config   # GNOME Shell OpenBar colors
│
└── [other-themes]/            # Additional themes...
```

### Required Files per Theme

Each theme folder must contain:

1. **`theme.json`** (required) - Theme colors and configuration
2. **`background.js`** (optional) - Custom background animation
3. **`openbar-theme-config`** (optional) - Desktop shell colors

## Available Themes

### 1. matrix-green-blue
**Cyberpunk Matrix Theme**
- Colors: Cyan-green (#00ff88, #00ddff)
- Background: Falling matrix rain animation
- Style: High-tech, cyberpunk aesthetic

### 2. ice-blue
**Arctic Clean Theme**
- Colors: Light blues (#aeefff, #7fd7ff, #4db8e8)
- Background: Icebergs with aurora and snowfall
- Style: Clean, minimal, cool tones

### 3. ubuntu
**Ubuntu Official Theme**
- Colors: Ubuntu orange (#e95420, #dd4814)
- Background: Ubuntu Circle of Friends logo
- Style: Ubuntu branding

### 4. clair-obscur
**Art Deco Gold Theme**
- Colors: Gold (#D3AF37, #FFED4E, #FFA500)
- Background: Animated golden geometry
- Style: Dark Art Deco, inspired by Expedition 33

### 5. sunset-equalizer
**Sunset Audio Theme**
- Colors: Red to yellow gradient (#ff1744 → #ffd700)
- Background: Animated equalizer bars
- Style: Audio visualization, warm sunset colors

### 6. synth-grid
**Synthwave Retrowave Theme**
- Colors: Magenta (#ff00ff) and cyan (#00ffff)
- Background: 3D grid with sun and mountains
- Style: 80s synthwave aesthetic

### 7. ascii-galaxy
**ASCII Space Theme**
- Colors: Green (#00ff00) and purple
- Background: ASCII art star field
- Style: Retro terminal aesthetic

### 8. circuit-board
**Tech Circuit Theme**
- Colors: Cyan-green (#00ffaa)
- Background: Animated circuit board paths
- Style: Electronic, tech aesthetic

### 9. quantum-tunnel
**Quantum Portal Theme**
- Colors: Purple-blue (#9966ff)
- Background: Rotating quantum rings
- Style: Sci-fi, dimensional portal

### 10. cyber-fortress
**Cyber Defense Theme**
- Colors: Bright blue (#0099ff)
- Background: Hexagonal shields and data particles
- Style: Cybersecurity, defensive systems

### 11. threat-map
**Security Operations Theme**
- Colors: Red (#ff3333)
- Background: Rotating globe with threat indicators
- Style: SOC operations, threat intelligence

### 12. soc-blueprint
**SOC Dashboard Theme**
- Colors: Cyan (#00ffc8)
- Background: Live metrics with radar and graphs
- Style: Security Operations Center dashboard

## Creating a New Theme

### Step 1: Create Theme Folder

```bash
mkdir theme/my-theme
```

### Step 2: Create theme.json

Minimum required configuration:

```json
{
  "--bg-color": "#0a0a0a",
  "--accent-1": "#ff6b35",
  "--accent-2": "#f7931e",
  "--panel-bg": "rgba(20,20,20,0.8)",
  "--panel-border": "rgba(255,107,53,0.3)",
  "--panel-shadow": "rgba(255,107,53,0.2)",
  "--title-shadow": "rgba(247,147,30,0.4)"
}
```

With background animation:

```json
{
  "--bg-color": "#0a0a0a",
  "--accent-1": "#ff6b35",
  "--accent-2": "#f7931e",
  "--panel-bg": "rgba(20,20,20,0.8)",
  "--panel-border": "rgba(255,107,53,0.3)",
  "--panel-shadow": "rgba(255,107,53,0.2)",
  "--title-shadow": "rgba(247,147,30,0.4)",
  "backgroundMode": "my-custom-animation"
}
```

### Step 3: Create background.js (Optional)

```javascript
(function() {
  let animationId = null;
  let particles = [];

  function start(canvas, mode) {
    if(mode !== 'my-custom-animation') return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = '0.4';

    // Initialize your animation
    for(let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1
      });
    }

    function draw() {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      ctx.fillStyle = '#ff6b35';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if(p.x < 0) p.x = canvas.width;
        if(p.x > canvas.width) p.x = 0;
        if(p.y < 0) p.y = canvas.height;
        if(p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    draw();
  }

  function stop() {
    if(animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    particles = [];
  }

  // Required: expose these methods
  window.THEME_BACKGROUND = {
    start: start,
    stop: stop
  };
})();
```

### Step 4: Build and Test

```bash
# Build single-file wallpapers (outputs to theme/compiled/)
cd theme && bash ../build.sh

# Test in browser
xdg-open theme/base/background.html

# Or with Hidamari - copy compiled wallpaper
cp theme/compiled/wallpaper-my-theme.html ~/WallpagesThemes/
```

## Theme Configuration

### CSS Variables

Available CSS variables for customization:

```css
--bg-color          /* Main background color */
--accent-1          /* Primary accent color */
--accent-2          /* Secondary accent color */
--panel-bg          /* Panel background (with alpha) */
--panel-border      /* Panel border color */
--panel-shadow      /* Panel shadow color */
--title-shadow      /* Title text shadow */
--clock-glow        /* Clock text glow (optional) */
--bar-fill-1        /* Progress bar gradient start */
--bar-fill-2        /* Progress bar gradient end */
```

### Runtime Theme Switching

```javascript
// In browser console or custom script

// Load theme by name
WALLPAPER_TEMPLATE.setThemeName('matrix-green-blue');

// Apply custom colors
WALLPAPER_TEMPLATE.applyTheme({
  '--accent-1': '#ff00ff',
  '--accent-2': '#00ffff'
});

// Change background mode
THEME_BACKGROUND.start(canvas, 'matrix');
```

## Background Animations

### Animation Structure

Background animations must expose:

```javascript
window.THEME_BACKGROUND = {
  start: function(canvas, mode) {
    // Initialize animation
    // mode: string from theme.json backgroundMode
  },
  stop: function() {
    // Clean up animation
    // Cancel requestAnimationFrame
    // Reset state
  }
};
```

### Best Practices

1. **Performance**: Keep animations lightweight
   - Limit particle count (< 100 for most effects)
   - Use `requestAnimationFrame` for smooth 60 FPS
   - Clear and redraw efficiently

2. **Transparency**: Set appropriate canvas opacity
   ```javascript
   canvas.style.opacity = '0.3'; // Don't overwhelm the UI
   ```

3. **Responsive**: Handle window resize
   ```javascript
   window.addEventListener('resize', () => {
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
   });
   ```

4. **Cleanup**: Always stop animations properly
   ```javascript
   function stop() {
     if(animationId) {
       cancelAnimationFrame(animationId);
       animationId = null;
     }
     // Clear arrays, reset state
   }
   ```

### Animation Examples

See existing theme implementations:
- `theme/matrix-green-blue/background.js` - Falling characters
- `theme/synth-grid/background.js` - 3D perspective grid
- `theme/threat-map/background.js` - Rotating 3D globe
- `theme/soc-blueprint/background.js` - Multiple layered effects

## OpenBar Integration

OpenBar is a GNOME Shell extension that colors the top bar. Each theme can include an `openbar-theme-config` file.

### Creating OpenBar Config

1. Copy from existing theme:
   ```bash
   cp theme/matrix-green-blue/openbar-theme-config theme/my-theme/
   ```

2. Update accent colors to match your theme:
   ```ini
   [/]
   accent-color=['1.0', '0.4', '0.2']    # RGB normalized [0-1]
   dark-accent-color=['1.0', '0.4', '0.2']
   light-accent-color=['1.0', '0.4', '0.2']
   ```

3. Update all themed UI elements:
   - `fgcolor` - Foreground/text color
   - `hcolor` - Highlight color
   - `mbcolor` - Menubar color
   - `mfgcolor` - Menu foreground
   - `mhcolor` - Menu highlight
   - `mscolor` - Menu selection
   - `candy1-16` - Indicator colors

### Color Format

OpenBar uses normalized RGB values [0.0 - 1.0]:

```
Hex #FF6B35 → RGB(255, 107, 53)
Normalized: [1.0, 0.42, 0.21]
```

## Testing Your Theme

### Local Testing

1. **Direct browser testing:**
   ```bash
   cd theme/base
   python -m http.server 8000
   # Open http://localhost:8000/background.html
   ```

2. **With live API:**
   ```bash
   # Start Flask API
   python src/app.py

   # Open wallpaper with theme
   xdg-open theme/_base/background.html
   ```

3. **Build and test single file:**
   ```bash
   cd theme && bash ../build.sh
   xdg-open compiled/wallpaper-my-theme.html
   ```

### Integration Testing

1. **Install to Hidamari:**
   ```bash
   sudo ./install.sh
   # Themes installed to ~/WallpagesThemes/
   ```

2. **Test with OpenBar:**
   - Install OpenBar GNOME extension
   - Import theme config: `theme/my-theme/openbar-theme-config`
   - Verify shell colors match theme

## Troubleshooting

### Theme Not Loading
- Check `theme.json` syntax (valid JSON)
- Verify theme folder name matches config
- Check browser console for errors

### Animation Not Running
- Verify `backgroundMode` in `theme.json` matches `start()` check
- Check `THEME_BACKGROUND` is properly exposed
- Look for JavaScript errors in console

### Colors Look Wrong
- Ensure CSS variables use correct format
- Check alpha channel in `rgba()` values
- Verify OpenBar colors are normalized [0-1]

### Performance Issues
- Reduce particle count
- Simplify drawing operations
- Add FPS limiting if needed
- Check for memory leaks (clear arrays in `stop()`)

## Resources

- [Example Themes](../../theme/) - Browse all available themes
- [API Documentation](api.md) - Backend API integration
- [Architecture](../architecture/overview.md) - System design
- [Hidamari Integration](hidamari.md) - Wallpaper engine setup
