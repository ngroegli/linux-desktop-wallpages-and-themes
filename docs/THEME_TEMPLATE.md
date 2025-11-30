# Theme Template

This document explains the `sample_theme` template and how to use it as a base for other designs.

Files and layout
- `sample_theme/background.html` — Original matrix/cyberpunk sample (kept as the special "matrix" sample).
- `sample_theme/ARCHIVE_NOTICE.md` — Note about deprecated duplicate template files (see `theme/` for canonical files).
- `theme/` — canonical location for the reusable base and per-theme folders:
  - `theme/base/` — contains the generic `background.html`, `template.css` and `template.js` (shared structure).
  - `theme/default/` — theme folder with `theme.json` (CSS variables) and optional assets.
  - `theme/ice-blue/` — example additional theme folder (ice-blue palette).

Quick usage
1. Open `sample_theme/template_background.html` in a browser (or point your Hidamari config to it).
2. To change the center image programmatically from other scripts:

```js
// e.g. run in browser console or from your web UI
WALLPAPER_TEMPLATE.setCenterImage('/path/to/image.jpg');
WALLPAPER_TEMPLATE.setTitle('My Wallpaper Title');
```

3. To use the Flask API for real stats (optional):

```js
// set base API URL (example: running docker compose exposes API at http://localhost:5000)
window.API_BASE = 'http://localhost:5000';
```

Theme configuration

The template uses CSS variables to control colors and accents. Themes are now stored per-folder in `theme/<name>/theme.json`. You can configure the theme in three ways:

- Provide a theme name (string) by setting `window.TEMPLATE_THEME = 'default'` or `window.TEMPLATE_THEME = 'ice-blue'`. The base script will load `theme/<name>/theme.json` relative to `theme/base/` and apply it at runtime.
- Provide a theme object directly in JS: `window.TEMPLATE_THEME = { "--accent-1": "#ff0000", "--bg-color": "#101010" }`.
- Use `window.TEMPLATE_CONFIG = { theme: 'ice-blue' }` where `theme` is either a name or an object.

Example (in browser console or page script):

```js
// by name (loads theme/<name>/theme.json relative to theme/base)
window.TEMPLATE_THEME = 'default';

// or by object
window.TEMPLATE_THEME = { '--accent-1': '#ffd166', '--accent-2': '#ff8a65' };

// or use TEMPLATE_CONFIG
window.TEMPLATE_CONFIG = { theme: 'ice-blue' };
```

The template exposes helper methods on `WALLPAPER_TEMPLATE`:

- `WALLPAPER_TEMPLATE.applyTheme(themeObject)` — apply CSS variable map immediately.
- `WALLPAPER_TEMPLATE.setThemeName(name)` — load `theme/<name>/theme.json` (relative to `theme/base/`) and apply the named theme.

Important paths and notes

- Place the base files in `theme/base/` and create one folder per theme under `theme/` (e.g. `theme/default/`, `theme/ice-blue/`). Each theme folder should contain a `theme.json` file with CSS variables.
- When opening the base `background.html` directly in a browser, theme loading uses relative paths from the `template.js` script location; keep `theme/` as a sibling directory of `base/` as created here.


Customization tips
- Colors and accents are controlled with CSS variables at the top of `template.css`. Create different `.css` files that override these variables and swap them in for different designs.
- Replace `.decor-overlay` with custom SVG overlays or animated canvases for more advanced visuals.
- The template intentionally keeps decoration minimal compared to the matrix sample. Copy and adapt pieces of `sample_theme/background.html` if you want to re-use matrix-like particles or canvas effects.

Design note
- The matrix sample (`background.html`) is intentionally preserved as a design example. The template is meant to be clean and flexible so it can be used as a starting point for many different looks.

If you want, I can also:
- Add an example theme variant that overrides the CSS variables (e.g., a warm theme).
- Add a small demo HTML that shows how to switch images/titles and toggle between the matrix and the template at runtime.
