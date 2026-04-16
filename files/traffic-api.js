/* ─────────────────────────────────────────────────────────────
   traffic-api.js  —  Live Traffic API Integration
   
   Connects your frontend to the Python backend (server.py).
   Replaces hardcoded/synthetic traffic data with real-time
   values from TomTom or HERE APIs.

   What this does:
   ─ Fetches live congestion level → updates the Traffic Clock card
   ─ Fetches nearby incidents      → shows a live incident banner
   ─ Fetches current gas price     → pre-fills the Trip Estimator
   ─ Polls every 60 seconds        → always fresh
   ─ Graceful degradation          → if backend is down, site still works
───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────
  const API_BASE    = '/api';
  const POLL_MS     = 60_000;   // refresh every 60 seconds
  const DEFAULT_LAT = 44.0521;
  const DEFAULT_LON = -123.0868;

  let userLat = DEFAULT_LAT;
  let userLon = DEFAULT_LON;
  let liveEnabled = false;

  // ── Try to get user's real location ─────────────────────────
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        userLat    = pos.coords.latitude;
        userLon    = pos.coords.longitude;
        liveEnabled = true;
        console.log('[TrafficAPI] Using real location:', userLat, userLon);
        pollAll();
      },
      function () {
        // Permission denied or unavailable — use default
        liveEnabled = true;
        console.log('[TrafficAPI] Using default location (geolocation denied)');
        pollAll();
      },
      { timeout: 5000, maximumAge: 300_000 }
    );
  } else {
    liveEnabled = true;
    pollAll();
  }

  // ── Poll everything ──────────────────────────────────────────
  function pollAll() {
    fetchFlow();
    fetchIncidents();
    fetchGasPrice();
  }

  setInterval(function () {
    if (liveEnabled) pollAll();
  }, POLL_MS);

  // ════════════════════════════════════════════════════════════
  //  1.  LIVE TRAFFIC FLOW → updates the Traffic Clock card
  // ════════════════════════════════════════════════════════════
  function fetchFlow() {
    fetch(`${API_BASE}/traffic/flow?lat=${userLat}&lon=${userLon}`)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        applyLiveFlow(data);
        updateLiveBadge(data);
        updateLiveStatusCard(data);
      })
      .catch(function (err) {
        console.warn('[TrafficAPI] Flow fetch failed — using synthetic data', err);
        hideLiveBadge();
      });
  }

  /**
   * applyLiveFlow()
   * 
   * The clock card normally reads from DATA.weekday/weekend arrays.
   * When we have a live reading, we override the displayed bar and label
   * with the real API value, but only when the slider is at "Now"
   * (i.e. simMinutes is null / slider shows "Now").
   */
  function applyLiveFlow(data) {
    const sliderLabel = document.getElementById('slider-label');
    if (!sliderLabel || sliderLabel.textContent !== 'Now') return; // user is simulating

    const level = data.congestionLevel; // 1–9
    const info  = (typeof DATA !== 'undefined') ? DATA.trafficInfo[level] : null;
    if (!info) return;

    const fill   = document.getElementById('traffic-fill');
    const label  = document.getElementById('traffic-label');
    const advice = document.getElementById('traffic-advice');

    if (fill)   { fill.style.width = info.pct + '%'; fill.style.background = info.color; }
    if (label)  { label.style.color = info.color; label.textContent = info.label; }
    if (advice) {
      const speedNote = data.synthetic
        ? ''
        : ` (${data.currentSpeed} mph, ${Math.round(data.ratio * 100)}% of free-flow)`;
      advice.textContent = info.advice + speedNote;
    }

    // Also update the heatmap "current hour" highlight
    highlightCurrentHour(level);
  }

  /** Highlight today's current hour cell in the heatmap */
  function highlightCurrentHour(level) {
    const now  = new Date();
    const day  = now.getDay(); // 0=Sun
    const hour = now.getHours();
    const cells = document.querySelectorAll('.heatmap-cell');
    // Grid is 7 rows × 24 cols; row index = day (Sun=0 in DATA.days)
    const idx = day * 24 + hour;
    cells.forEach(function (c) { c.classList.remove('heatmap-live'); });
    if (cells[idx]) cells[idx].classList.add('heatmap-live');
  }

  // ════════════════════════════════════════════════════════════
  //  2.  LIVE INCIDENTS → banner above the Incident Simulator
  // ════════════════════════════════════════════════════════════
  function fetchIncidents() {
    fetch(`${API_BASE}/traffic/incidents?lat=${userLat}&lon=${userLon}&radius=8`)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        renderIncidentBanner(data.incidents || []);
      })
      .catch(function () {
        renderIncidentBanner([]);
      });
  }

  function renderIncidentBanner(incidents) {
    // Find or create the banner element just above the incident simulator section
    let banner = document.getElementById('live-incidents-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'live-incidents-banner';
      banner.className = 'live-incidents-banner';
      const section = document.getElementById('section-incidents');
      if (section) section.parentNode.insertBefore(banner, section);
    }

    if (!incidents.length) {
      banner.style.display = 'none';
      return;
    }

    const SEVERITY_LABELS = ['', 'Unknown', 'Minor', 'Moderate', 'Major', 'Critical'];
    const SEVERITY_COLORS = ['', '#6ee7b7', '#fbbf24', '#f97316', '#ef4444', '#991b1b'];
    const TYPE_ICONS = {
      'ACCIDENT': '🚨', 'JAM': '🚗', 'ROAD_WORK': '🚧',
      'LANE_CLOSED': '🔒', 'ROAD_CLOSED': '⛔', 'WEATHER': '🌧️',
    };

    banner.style.display = 'block';
    banner.innerHTML = `
      <div class="lib-header">
        <span class="lib-dot live-pulse"></span>
        <strong>Live Nearby Incidents</strong>
        <span class="lib-count">${incidents.length} active</span>
        <span class="lib-updated">Updated just now</span>
      </div>
      <div class="lib-list">
        ${incidents.map(function (inc) {
          const sev   = Math.min(5, Math.max(1, inc.severity || 1));
          const color = SEVERITY_COLORS[sev];
          const icon  = TYPE_ICONS[inc.type] || '⚠️';
          const delay = inc.delay > 60
            ? Math.round(inc.delay / 60) + ' min delay'
            : (inc.delay ? inc.delay + 's delay' : '');
          return `<div class="lib-item" style="border-left-color:${color}">
            <span class="lib-icon">${icon}</span>
            <div class="lib-info">
              <div class="lib-desc">${inc.description}</div>
              <div class="lib-meta" style="color:${color}">
                ${SEVERITY_LABELS[sev]} · ${inc.roadName || 'Nearby road'}
                ${delay ? ' · ' + delay : ''}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  // ════════════════════════════════════════════════════════════
  //  3.  GAS PRICE → pre-fills the Trip Cost Estimator
  // ════════════════════════════════════════════════════════════
  function fetchGasPrice() {
    fetch(`${API_BASE}/gas/price`)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        const input = document.getElementById('f-price');
        if (input && data.price) {
          input.value = data.price.toFixed(2);
          // Add a subtle "live" label next to the input
          let lbl = document.getElementById('gas-price-live-lbl');
          if (!lbl) {
            lbl = document.createElement('span');
            lbl.id = 'gas-price-live-lbl';
            lbl.className = 'live-tag';
            input.parentNode.appendChild(lbl);
          }
          lbl.textContent = `live · ${data.state || 'regional'}`;
        }
      })
      .catch(function () { /* keep the hardcoded default */ });
  }

  // ════════════════════════════════════════════════════════════
  //  4.  "LIVE" badge on the Traffic Clock card
  // ════════════════════════════════════════════════════════════
  /** Update the Live Traffic Feed status card */
  function updateLiveStatusCard(data) {
    const statusEl = document.getElementById('live-api-status');
    if (statusEl) {
      statusEl.textContent = data.synthetic ? 'Using time-of-day model (no API key)' : 'Connected · ' + data.source + ' API';
      statusEl.style.color = data.synthetic ? 'var(--yellow)' : 'var(--green)';
    }
    const locEl = document.getElementById('live-location-text');
    if (locEl) locEl.textContent = Math.round(userLat*1000)/1000 + '°, ' + Math.round(userLon*1000)/1000 + '°';
    const metricsEl = document.getElementById('live-metrics');
    if (metricsEl) metricsEl.style.display = 'grid';
    const setM = function(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    setM('lm-speed',    data.currentSpeed  ? data.currentSpeed  + ' mph' : '—');
    setM('lm-freeflow', data.freeFlowSpeed ? data.freeFlowSpeed + ' mph' : '—');
    setM('lm-ratio',    data.ratio ? Math.round(data.ratio * 100) + '%' : '—');
    setM('lm-source',   data.source || '—');
    var ratioEl = document.getElementById('lm-ratio');
    if (ratioEl && data.ratio) ratioEl.style.color = data.ratio >= 0.7 ? 'var(--green)' : data.ratio >= 0.4 ? 'var(--yellow)' : 'var(--red)';
    var noKey = document.getElementById('live-no-key-msg');
    if (noKey) noKey.style.display = data.synthetic ? 'block' : 'none';
    var lastEl = document.getElementById('live-last-updated');
    if (lastEl) lastEl.textContent = new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

    function updateLiveBadge(data) {
    let badge = document.getElementById('traffic-live-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'traffic-live-badge';
      badge.className = 'live-tag';
      const title = document.querySelector('#clock-display');
      if (title && title.parentNode) {
        title.parentNode.insertBefore(badge, title);
      }
    }
    badge.style.display = 'inline-flex';
    const src = data.synthetic ? '⚙ synthetic' : `🔴 live · ${data.source}`;
    badge.textContent = src;
  }

  function hideLiveBadge() {
    const badge = document.getElementById('traffic-live-badge');
    if (badge) badge.style.display = 'none';
  }

  // ════════════════════════════════════════════════════════════
  //  5.  API STATUS CHECK (shown in browser console)
  // ════════════════════════════════════════════════════════════
  fetch(`${API_BASE}/status`)
    .then(function (r) { return r.json(); })
    .then(function (s) {
      console.log(
        `%c[TrafficAPI] Server OK — TomTom: ${s.apis.tomtom ? '✅' : '⚠️ no key'}  HERE: ${s.apis.here ? '✅' : '⚠️ no key'}`,
        'color: #34d399; font-weight: bold'
      );
    })
    .catch(function () {
      console.warn('[TrafficAPI] Backend not running. Start server.py to enable live data.');
    });

})();
