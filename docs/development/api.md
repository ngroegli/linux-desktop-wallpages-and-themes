# Flask API Documentation

The Flask API provides real-time system metrics for the wallpaper frontend.

## Overview

- Built with Flask, Flask-RESTX, and `psutil`
- Runs as a systemd service on port 5000
- CORS-enabled for browser access
- Graceful fallback when API is unavailable
- **Interactive Swagger UI documentation at `/api`**

## Interactive API Documentation

The API includes full OpenAPI/Swagger documentation with an interactive testing interface:

**URL:** http://localhost:5000/api

The Swagger UI allows you to:
- Browse all available endpoints
- See request/response schemas
- Test endpoints directly in the browser
- View example responses
- Download the OpenAPI specification

## API Endpoints

### Core Endpoint

#### `GET /api/stats`
**Recommended:** Returns all system metrics in a single call.

**Response:**
```json
{
  "cpu": {
    "percent": 45.2,
    "cores": 8,
    "per_core": [42.1, 48.3, 44.5, 46.7, 43.2, 47.8, 45.1, 44.9]
  },
  "ram": {
    "total": 17179869184,
    "used": 8234567890,
    "available": 8945301294,
    "percent": 47.9
  },
  "disk": {
    "total": 512110190592,
    "used": 123456789012,
    "free": 388653401580,
    "percent": 24.1
  },
  "network": {
    "bytes_sent": 123456789,
    "bytes_recv": 987654321,
    "packets_sent": 456789,
    "packets_recv": 789123
  },
  "os": {
    "system": "Linux",
    "distro": "Ubuntu",
    "version": "24.04",
    "codename": "noble",
    "kernel": "6.14.0-36-generic",
    "architecture": "x86_64"
  }
}
```

### Individual Endpoints

#### `GET /api/cpu`
Returns CPU usage statistics.

**Response:**
```json
{
  "percent": 45.2,
  "cores": 8,
  "per_core": [42.1, 48.3, 44.5, 46.7, 43.2, 47.8, 45.1, 44.9]
}
```

#### `GET /api/ram`
Returns RAM usage statistics.

**Response:**
```json
{
  "total": 17179869184,
  "used": 8234567890,
  "available": 8945301294,
  "percent": 47.9
}
```

#### `GET /api/disk`
Returns disk usage statistics.

**Response:**
```json
{
  "total": 512110190592,
  "used": 123456789012,
  "free": 388653401580,
  "percent": 24.1
}
```

#### `GET /api/network`
Returns network I/O counters.

**Response:**
```json
{
  "bytes_sent": 123456789,
  "bytes_recv": 987654321,
  "packets_sent": 456789,
  "packets_recv": 789123
}
```

#### `GET /api/os`
Returns operating system information.

**Response:**
```json
{
  "system": "Linux",
  "distro": "Ubuntu",
  "version": "24.04",
  "codename": "noble",
  "kernel": "6.14.0-36-generic",
  "architecture": "x86_64"
}
```

#### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Usage Example

```bash
# Get all stats (recommended)
curl http://localhost:5000/api/stats

# Get specific metric
curl http://localhost:5000/api/ram
```

```javascript
// In wallpaper JavaScript
async function fetchStats() {
  const response = await fetch('http://localhost:5000/api/stats');
  const data = await response.json();

  updateCPU(data.cpu.percent);
  updateRAM(data.ram.percent);
  updateDisk(data.disk.percent);
  updateNetwork(data.network);
}
```

## Data Format Notes

- **Sizes**: All byte values are in bytes (not KB/MB/GB). Convert on the client side for display.
- **Percentages**: Float values from 0-100
- **Per-core CPU**: Array of percentages, one per logical core
- **Network counters**: Cumulative since system boot

## Development Notes

### Architecture
- `src/app.py` - Main Flask application and WSGI entry point
- Uses `psutil` library for cross-platform system metrics
- CORS enabled via `flask-cors` for browser access

### Running Locally
```bash
# Install dependencies
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run development server
python src/app.py
```

The API will be available at `http://localhost:5000`

### Docker Development
```bash
docker compose up --build
```

### Production Deployment
The systemd service uses Gunicorn for better performance and reliability:
```bash
sudo ./install.sh
```

### Performance Considerations
- Metrics collection is lightweight (psutil is efficient)
- `/api/stats` combines multiple metrics but remains fast
- For high-frequency polling (< 100ms), consider implementing caching
- Keep measurements synchronous - psutil calls are fast enough

### Extending the API
When adding new endpoints:
1. Add route in `src/app.py`
2. Use `psutil` for system metrics
3. Return JSON with consistent structure
4. Update this documentation
5. Consider adding to `/api/stats` for convenience
