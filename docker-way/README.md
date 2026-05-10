# Steam Header Image Server

Minimal Node.js service that returns the Steam header image for any app.  
**Zero dependencies** — uses only Node built-ins.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/header?appid=<id>` | Returns the header image (proxied JPEG/PNG) |
| GET | `/health` | Health check → `{"status":"ok"}` |

**Example:**
```
GET http://localhost:3000/header?appid=2807960
```

---

## Deploy with Docker

### Option A — docker compose (recommended)
```bash
docker compose up -d
```

### Option B — manual build & run
```bash
docker build -t steam-header .
docker run -d -p 3000:3000 --restart unless-stopped steam-header
```

### Option C — custom port
```bash
docker run -d -p 8080:8080 -e PORT=8080 steam-header
```

---

## Resource usage
- Base image: `node:22-alpine` (~60 MB)
- RAM at idle: ~20–30 MB
- CPU: near 0% at idle
