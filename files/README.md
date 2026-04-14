# City Driving Efficiency Tool — Setup Guide

A traffic intelligence dashboard with **real-time data** from TomTom or HERE APIs,
served through a lightweight Python backend.

---

## Project Structure

```
traffic-project/
├── index.html          ← Main page (updated to show live data)
├── server.py           ← Python backend (API proxy + static server)
├── requirements.txt    ← Python dependencies
├── .env.example        ← Copy to .env and add your API keys
├── .env                ← Your keys (never commit this!)
├── css/
│   └── styles.css      ← All styles (includes new live-data classes)
└── js/
    ├── data.js         ← Static data / hardcoded fallbacks
    ├── clock.js        ← Traffic clock + heatmap
    ├── decision.js     ← Route decision helper
    ├── estimator.js    ← Trip cost estimator
    ├── score.js        ← Efficiency score sliders
    ├── tips.js         ← Filterable tips library
    ├── incidents.js    ← Incident simulator
    ├── realworld.js    ← Real-world impact cards
    ├── intro.js        ← Page-load animation
    └── traffic-api.js  ← ★ NEW: Live API integration
```

---

## Quick Start (5 minutes)

### Step 1 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 2 — Get a free API key (pick one or both)

**Option A — TomTom** (recommended, easiest)
1. Go to https://developer.tomtom.com/
2. Click "Get a free API key"
3. Create an account → your key appears on the dashboard
4. Free tier: **2,500 requests/day** (plenty for personal/demo use)

**Option B — HERE**
1. Go to https://developer.here.com/
2. Create a free account
3. Create a new project → copy the API key
4. Free tier: **250,000 requests/month**

> **No key?** The app still works! It falls back to a time-of-day synthetic
> model using your existing DATA.weekday/weekend arrays. Everything functions
> the same — just not sourced from a live feed.

### Step 3 — Configure your .env

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
TOMTOM_API_KEY=your_actual_key_here
HERE_API_KEY=your_actual_key_here   # optional second source

DEFAULT_LAT=44.0521
DEFAULT_LON=-123.0868
DEFAULT_CITY=Eugene, OR

STATE_CODE=OR   # for gas price regional estimates
```

To find your city's coordinates: https://www.latlong.net/

### Step 4 — Run the server

```bash
python server.py
```

You'll see:
```
=======================================================
  City Driving Efficiency Tool — Backend Server
=======================================================
  TomTom API: ✅ configured
  HERE API:   ⚠️  not set (using fallback)
  Default:    Eugene, OR (44.0521, -123.0868)
  URL:        http://localhost:5000
=======================================================
```

### Step 5 — Open the app

Visit **http://localhost:5000** in your browser.

---

## What the Live Integration Does

| Feature | Without API key | With API key |
|---|---|---|
| Traffic Clock | Synthetic (time model) | Real speed + congestion level |
| Live Feed Card | Shows "synthetic" notice | Speed, free-flow, ratio from API |
| Incident Banner | Hidden | Shows real nearby incidents |
| Gas Price | Hardcoded $3.79 | Regional estimate auto-filled |
| Heatmap highlight | None | Current hour highlighted in real time |

---

## API Endpoints (for your own use / debugging)

All endpoints are served by `server.py` at `http://localhost:5000`:

| Endpoint | Description |
|---|---|
| `GET /api/traffic/flow?lat=44.05&lon=-123.09` | Real-time congestion level + speeds |
| `GET /api/traffic/incidents?lat=44.05&lon=-123.09&radius=8` | Nearby incidents (radius in km) |
| `GET /api/gas/price` | Current regional gas price |
| `GET /api/status` | Server health + which APIs are configured |

Example:
```bash
curl http://localhost:5000/api/traffic/flow?lat=44.05&lon=-123.09
```

Response:
```json
{
  "source": "TomTom",
  "currentSpeed": 28,
  "freeFlowSpeed": 35,
  "ratio": 0.800,
  "congestionLevel": 2,
  "confidence": 0.9,
  "roadClosure": false,
  "timestamp": "2026-04-13T20:00:00Z",
  "location": { "lat": 44.0521, "lon": -123.0868 }
}
```

---

## Changing the Default City

Edit `.env`:
```
DEFAULT_LAT=40.7128
DEFAULT_LON=-74.0060
DEFAULT_CITY=New York, NY
STATE_CODE=NY
```

The browser will also ask for the user's real GPS location on page load.
If they allow it, their actual location is used instead.

---

## Deploying Beyond Localhost

To put this online, you can deploy `server.py` to any Python host:

- **Render.com** — free tier, push to GitHub and connect
- **Railway.app** — free tier, simple CLI deploy
- **Heroku** — add a `Procfile`: `web: python server.py`
- **VPS (DigitalOcean / Linode)** — run with `gunicorn server:app`

Remember to set your environment variables in the host's dashboard
(not via `.env` file, which should never be committed).

---

## Troubleshooting

**"Connecting to traffic API…" never changes**
→ Make sure `server.py` is running and visit http://localhost:5000/api/status

**TomTom returns 403**
→ Your API key is wrong or you haven't enabled the Traffic API product in your TomTom dashboard

**No incidents showing**
→ Normal! Incidents only appear when TomTom detects real events near your coordinates.
   Try coordinates for a busy city like LA (34.05, -118.24) to test.

**Gas price not updating**
→ The gas price uses a regional static estimate. For real-time prices, sign up for
   CollectAPI (https://collectapi.com/api/gasPrice) and add `COLLECT_API_KEY` to `.env`,
   then update the `fetch_gas_price()` function in `server.py`.
