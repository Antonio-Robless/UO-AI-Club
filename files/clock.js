/* ─────────────────────────────────────────────────────────────
   clock.js  —  Live traffic clock + weekly heatmap
───────────────────────────────────────────────────────────── */

(function () {
  let simMinutes = null; // null = track real time

  /* ── Helpers ── */
  function levelAt(totalMin, isWeekend) {
    const h    = Math.floor(totalMin / 60) % 24;
    const src  = isWeekend ? DATA.weekend : DATA.weekday;
    const raw  = src[h];
    const next = src[(h + 1) % 24];
    const frac = (totalMin % 60) / 60;
    return raw + (next - raw) * frac;
  }

  function fmtHour12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  /* ── Update clock display ── */
  function updateClock() {
    const now       = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    let totalMin;

    if (simMinutes !== null) {
      totalMin = simMinutes;
    } else {
      totalMin = now.getHours() * 60 + now.getMinutes();
      document.getElementById('time-slider').value = totalMin;
      document.getElementById('slider-label').textContent = 'Now';
    }

    /* Clock digits */
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    const s = simMinutes !== null ? 0 : now.getSeconds();
    document.getElementById('clock-display').textContent =
      `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    /* Traffic bar */
    const level = levelAt(totalMin, isWeekend);
    const key   = Math.min(9, Math.max(1, Math.round(level)));
    const info  = DATA.trafficInfo[key];

    document.getElementById('traffic-fill').style.width      = info.pct + '%';
    document.getElementById('traffic-fill').style.background = info.color;
    document.getElementById('traffic-label').style.color     = info.color;
    document.getElementById('traffic-label').textContent     = info.label;
    document.getElementById('traffic-advice').textContent    = info.advice;
  }

  /* ── Slider: simulate any time of day ── */
  document.getElementById('time-slider').addEventListener('input', function () {
    simMinutes = parseInt(this.value);
    const h = Math.floor(simMinutes / 60) % 24;
    const m = simMinutes % 60;
    document.getElementById('slider-label').textContent = fmtHour12(h, m);
    updateClock();
  });

  /* Double-click resets to real time */
  document.getElementById('time-slider').addEventListener('dblclick', function () {
    simMinutes = null;
    document.getElementById('slider-label').textContent = 'Now';
    updateClock();
  });

  updateClock();
  setInterval(updateClock, 1000);

  /* ── Heatmap ── */
  function heatColor(level) {
    // Bright, readable on white background: green → yellow → orange → red
    const colors = ['#bbf7d0','#6ee7b7','#34d399','#fde68a','#fbbf24','#fb923c','#ef4444','#dc2626','#991b1b'];
    return colors[Math.min(8, Math.max(0, Math.round(level) - 1))];
  }

  function buildHeatmap() {
    /* Hour labels row */
    const hoursEl = document.getElementById('heatmap-hours');
    let hoursHTML = '<div></div>';
    for (let h = 0; h < 24; h++) {
      const lbl = h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`;
      hoursHTML += `<div class="hour-label">${h % 3 === 0 ? lbl : ''}</div>`;
    }
    hoursEl.innerHTML = hoursHTML;

    /* Day rows */
    const grid = document.getElementById('heatmap-grid');
    grid.className = 'heatmap-grid';
    let html = '';
    for (let d = 0; d < 7; d++) {
      html += `<div class="heatmap-label">${DATA.days[d]}</div>`;
      const isWeekend = d === 0 || d === 6;
      for (let h = 0; h < 24; h++) {
        const level = isWeekend ? DATA.weekend[h] : DATA.weekday[h];
        const info  = DATA.trafficInfo[level];
        html += `<div class="heatmap-cell" style="background:${heatColor(level)}"
                      data-tip="${DATA.days[d]} ${h}:00 — ${info.label}"></div>`;
      }
    }
    grid.innerHTML = html;
  }

  buildHeatmap();
})();
