"""
server.py — City Driving Efficiency Tool Backend
=================================================
Serves the static site AND proxies real-time traffic APIs
so your API keys never appear in the browser.

Setup:
  pip install flask flask-cors requests python-dotenv

Run:
  python server.py
  → Opens at http://localhost:5000

API keys go in .env (see .env.example)
"""

import os
import time
import json
import requests
from datetime import datetime
from functools import wraps
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

# ── Config ────────────────────────────────────────────────────
TOMTOM_KEY = os.getenv("TOMTOM_API_KEY", "")
HERE_KEY   = os.getenv("HERE_API_KEY", "")

# Default location (Eugene, OR — change to your city)
DEFAULT_LAT = 44.0521
DEFAULT_LON = -123.0868
DEFAULT_CITY = "Eugene, OR"

# Simple in-memory cache: { cache_key: (timestamp, data) }
_cache = {}
CACHE_TTL = 60  # seconds — refresh traffic data every 60s


# ── Cache helper ──────────────────────────────────────────────
def cached(ttl=CACHE_TTL):
    """Decorator: caches the return value of a function for `ttl` seconds."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = fn.__name__ + str(args) + str(kwargs)
            now = time.time()
            if key in _cache:
                ts, data = _cache[key]
                if now - ts < ttl:
                    return data
            result = fn(*args, **kwargs)
            _cache[key] = (now, result)
            return result
        return wrapper
    return decorator


# ── TomTom helpers ────────────────────────────────────────────
@cached(ttl=60)
def fetch_tomtom_flow(lat, lon):
    """
    Fetch real-time traffic flow for a point via TomTom.
    Returns normalized dict or None on failure.
    """
    if not TOMTOM_KEY:
        return None
    try:
        url = (
            f"https://api.tomtom.com/traffic/services/4/flowSegmentData/"
            f"absolute/10/json?point={lat},{lon}&key={TOMTOM_KEY}"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        d = r.json()["flowSegmentData"]
        current  = d.get("currentSpeed", 0)
        freeflow = d.get("freeFlowSpeed", 1)
        ratio    = current / freeflow if freeflow else 1

        # Map ratio to our 1–9 congestion scale
        if ratio >= 0.90:   level = 1
        elif ratio >= 0.80: level = 2
        elif ratio >= 0.70: level = 3
        elif ratio >= 0.60: level = 4
        elif ratio >= 0.50: level = 5
        elif ratio >= 0.40: level = 6
        elif ratio >= 0.30: level = 7
        elif ratio >= 0.20: level = 8
        else:               level = 9

        return {
            "source":       "TomTom",
            "currentSpeed": current,
            "freeFlowSpeed":freeflow,
            "ratio":        round(ratio, 3),
            "congestionLevel": level,
            "confidence":   d.get("confidence", 1),
            "roadClosure":  d.get("roadClosure", False),
        }
    except Exception as e:
        print(f"[TomTom flow] error: {e}")
        return None


@cached(ttl=90)
def fetch_tomtom_incidents(lat, lon, radius_km=5):
    """
    Fetch nearby traffic incidents via TomTom Incident Details API.
    Returns list of simplified incident dicts.
    """
    if not TOMTOM_KEY:
        return []
    try:
        # Bounding box from center + radius
        deg = radius_km / 111.0
        bbox = f"{lat-deg},{lon-deg},{lat+deg},{lon+deg}"
        url = (
            f"https://api.tomtom.com/traffic/services/5/incidentDetails"
            f"?bbox={bbox}&fields={{incidents{{type,geometry,properties}}}}"
            f"&language=en-GB&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11"
            f"&key={TOMTOM_KEY}"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        raw = r.json().get("incidents", [])

        incidents = []
        for inc in raw[:10]:  # cap at 10
            props = inc.get("properties", {})
            # Extract lat/lon from GeoJSON geometry
            geom = inc.get("geometry", {})
            coords = geom.get("coordinates", [])
            inc_lat, inc_lon = None, None
            if geom.get("type") == "Point" and len(coords) >= 2:
                inc_lon, inc_lat = coords[0], coords[1]
            elif geom.get("type") == "LineString" and coords:
                # Use midpoint of line
                mid = coords[len(coords) // 2]
                inc_lon, inc_lat = mid[0], mid[1]
            incidents.append({
                "type":        inc.get("type", "UNKNOWN"),
                "severity":    props.get("magnitudeOfDelay", 0),
                "description": props.get("events", [{}])[0].get("description", "Traffic incident"),
                "delay":       props.get("delay", 0),
                "roadName":    props.get("from", "") or props.get("roadNumbers", ["Unknown"])[0],
                "startTime":   props.get("startTime", ""),
                "endTime":     props.get("endTime", ""),
                "lat":         inc_lat,
                "lon":         inc_lon,
            })
        return incidents
    except Exception as e:
        print(f"[TomTom incidents] error: {e}")
        return []


# ── HERE helpers ───────────────────────────────────────────────
@cached(ttl=60)
def fetch_here_flow(lat, lon):
    """
    Fetch real-time traffic flow via HERE Traffic API v7.
    Returns normalized dict or None on failure.
    """
    if not HERE_KEY:
        return None
    try:
        url = (
            f"https://data.traffic.hereapi.com/v7/flow"
            f"?locationReferencing=shape"
            f"&in=circle:{lat},{lon};r=500"
            f"&apiKey={HERE_KEY}"
        )
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        results = r.json().get("results", [])
        if not results:
            return None

        # Average across nearby segments
        speeds, ffspeeds = [], []
        for seg in results:
            cf = seg.get("currentFlow", {})
            sp = cf.get("speed")
            ff = cf.get("freeFlow")
            if sp is not None: speeds.append(sp)
            if ff is not None: ffspeeds.append(ff)

        if not speeds:
            return None

        avg_speed = sum(speeds) / len(speeds)
        avg_ff    = sum(ffspeeds) / len(ffspeeds) if ffspeeds else avg_speed
        ratio     = avg_speed / avg_ff if avg_ff else 1

        if ratio >= 0.90:   level = 1
        elif ratio >= 0.80: level = 2
        elif ratio >= 0.70: level = 3
        elif ratio >= 0.60: level = 4
        elif ratio >= 0.50: level = 5
        elif ratio >= 0.40: level = 6
        elif ratio >= 0.30: level = 7
        elif ratio >= 0.20: level = 8
        else:               level = 9

        return {
            "source":          "HERE",
            "currentSpeed":    round(avg_speed, 1),
            "freeFlowSpeed":   round(avg_ff, 1),
            "ratio":           round(ratio, 3),
            "congestionLevel": level,
            "segmentCount":    len(speeds),
        }
    except Exception as e:
        print(f"[HERE flow] error: {e}")
        return None


# ── Gas price helper (GasBuddy-style scrape or static fallback) ──
@cached(ttl=3600)  # cache 1 hr
def fetch_gas_price():
    """
    Tries to get a real gas price. Falls back to a regional estimate.
    You can replace this with a paid API (e.g. CollectAPI gas prices).
    """
    # Static regional fallback by state (updated periodically)
    FALLBACK_PRICES = {
        "OR": 3.89, "CA": 4.45, "WA": 3.99, "TX": 3.10,
        "NY": 3.65, "FL": 3.29, "IL": 3.55, "default": 3.55,
    }
    state = os.getenv("STATE_CODE", "OR")
    price = FALLBACK_PRICES.get(state, FALLBACK_PRICES["default"])
    return {
        "price":    price,
        "currency": "USD",
        "per":      "gallon",
        "source":   "regional estimate",
        "state":    state,
    }


# ══════════════════════════════════════════════════════════════
#  API ROUTES
# ══════════════════════════════════════════════════════════════

@app.route("/api/traffic/flow")
def api_flow():
    """
    GET /api/traffic/flow?lat=44.05&lon=-123.09
    Returns real-time congestion level + speeds for a point.
    Falls back gracefully if no API key is configured.
    """
    lat = float(request.args.get("lat", DEFAULT_LAT))
    lon = float(request.args.get("lon", DEFAULT_LON))

    # Try TomTom first, then HERE, then synthetic fallback
    data = fetch_tomtom_flow(lat, lon)
    if not data:
        data = fetch_here_flow(lat, lon)
    if not data:
        # Synthetic fallback based on time-of-day
        hour = datetime.now().hour
        weekday = datetime.now().weekday()  # 0=Mon, 6=Sun
        is_weekend = weekday >= 5
        # Mirror your DATA.weekday / DATA.weekend arrays
        weekday_pattern = [1,1,1,1,1,2,3,8,9,6,5,5,6,5,5,6,7,9,8,5,4,3,2,1]
        weekend_pattern = [1,1,1,1,1,1,1,2,3,4,5,6,7,7,6,6,6,5,4,3,2,2,1,1]
        pattern = weekend_pattern if is_weekend else weekday_pattern
        level = pattern[hour]
        data = {
            "source":          "synthetic (no API key)",
            "currentSpeed":    [35,30,25,22,18,14,10,7,5][level-1],
            "freeFlowSpeed":   35,
            "ratio":           round([1,.86,.71,.63,.51,.40,.29,.20,.14][level-1], 3),
            "congestionLevel": level,
            "synthetic":       True,
        }

    data["timestamp"] = datetime.utcnow().isoformat() + "Z"
    data["location"]  = {"lat": lat, "lon": lon}
    return jsonify(data)


@app.route("/api/traffic/incidents")
def api_incidents():
    """
    GET /api/traffic/incidents?lat=44.05&lon=-123.09&radius=5
    Returns list of nearby traffic incidents.
    """
    lat    = float(request.args.get("lat", DEFAULT_LAT))
    lon    = float(request.args.get("lon", DEFAULT_LON))
    radius = float(request.args.get("radius", 5))

    incidents = fetch_tomtom_incidents(lat, lon, radius)
    return jsonify({
        "incidents":  incidents,
        "count":      len(incidents),
        "timestamp":  datetime.utcnow().isoformat() + "Z",
        "location":   {"lat": lat, "lon": lon},
        "radiusKm":   radius,
    })


@app.route("/api/gas/price")
def api_gas():
    """
    GET /api/gas/price
    Returns current regional gas price estimate.
    """
    return jsonify(fetch_gas_price())


@app.route("/api/status")
def api_status():
    """
    GET /api/status
    Returns server health + which APIs are configured.
    """
    return jsonify({
        "status":   "ok",
        "version":  "1.0.0",
        "apis": {
            "tomtom": bool(TOMTOM_KEY),
            "here":   bool(HERE_KEY),
        },
        "defaultLocation": {
            "lat":  DEFAULT_LAT,
            "lon":  DEFAULT_LON,
            "city": DEFAULT_CITY,
        },
        "cacheItems": len(_cache),
        "timestamp":  datetime.utcnow().isoformat() + "Z",
    })


# ── Static file serving ───────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*55)
    print("  City Driving Efficiency Tool — Backend Server")
    print("="*55)
    print(f"  TomTom API: {'✅ configured' if TOMTOM_KEY else '⚠️  not set (using fallback)'}")
    print(f"  HERE API:   {'✅ configured' if HERE_KEY   else '⚠️  not set (using fallback)'}")
    print(f"  Default:    {DEFAULT_CITY} ({DEFAULT_LAT}, {DEFAULT_LON})")
    print(f"  URL:        http://localhost:5000")
    print("="*55 + "\n")
    app.run(debug=True, port=8080, host="0.0.0.0")
