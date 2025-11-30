# Flask API

This Flask application exposes system metrics for use by the web frontend (Hidamari).

## Endpoints

- `GET /api/disk` - Returns disk usage (total, used, free, percent).
- `GET /api/ram` - Returns RAM usage (total, available, used, percent).
- `GET /api/cpu` - Returns CPU usage (overall percent, per-core breakdown, count).
- `GET /api/network` - Returns network IO counters (bytes_sent, bytes_recv, packets_sent, packets_recv).
- `GET /api/health` - Simple health check returning `{ "status": "ok" }`.

## Example

Request:

```
curl http://localhost:5000/api/ram
```

Response:

```json
{
  "total": 17179869184,
  "available": 1234567890,
  "used": 4823456789,
  "percent": 28.1
}
```

## Notes
- Endpoints return raw numeric values (bytes for sizes). Convert on the client if you need human-readable units.
- The server uses `psutil` to gather metrics.