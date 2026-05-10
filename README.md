# steamimg

Returns the Steam header image for any app, deployed on Vercel.  
Zero dependencies — Node built-ins only.

## Endpoint

```
GET /header?appid=<steam_appid>
```

**Example:**
```
https://steamimg.vercel.app/header?appid=2807960
```
Returns the header image directly (JPEG).

---

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo → Deploy (no config needed)

---

## Project structure
```
steamimg/
├── api/
│   └── header.js   ← serverless function
├── vercel.json      ← rewrites /header → /api/header
└── package.json
```
