# Architecture

Repository layout:

- `docs/` - Project documentation (this folder).
- `src/` - Flask application that provides system metrics APIs.
  - `src/app.py` - Flask entrypoint exposing the `/api/*` endpoints.
  - `src/utils/system_metrics.py` - Helper functions that gather metrics using `psutil`.
- `theme/` - Place themes and wallpaper metadata here for Hidamari.

The Flask service is intended to run as a small API service (Docker-ready). The frontend (Hidamari/web app) will query the endpoints to show system metrics in the UI or adapt wallpaper behavior.

Security considerations:
- The API exposes machine-level metrics. Run it behind any required authentication or firewall if exposing beyond localhost.

