# Developer notes - Flask API

- The app uses `psutil` for collecting system metrics.
- `src/app.py` is the WSGI entrypoint (exposes `app`). Gunicorn is used inside Docker for a more robust server.
- Keep heavy or long-running measurements off the request thread if you expand functionality (use background workers or caching).