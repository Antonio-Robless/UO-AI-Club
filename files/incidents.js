/* ─────────────────────────────────────────────────────────────
   incidents.js  —  Extreme Incident Simulator
───────────────────────────────────────────────────────────── */

(function () {
  const state = {
    incident:  null,
    roadType:  null,
    trafficLvl: null,
  };

  /* ── Build incident type buttons ── */
  function buildIncidentTypes() {
    const el = document.getElementById('incident-type-grid');
    el.innerHTML = Object.entries(DATA.incidents).map(function (entry) {
      const k = entry[0]; const v = entry[1];
      return `<button class="inc-btn" data-key="${k}" onclick="selectIncident('${k}')">
        <span class="inc-icon"><i data-lucide="${v.icon}"></i></span>
        <span class="inc-name">${v.name}</span>
      </button>`;
    }).join('');
  }

  /* ── Build road type buttons ── */
  function buildRoadTypes() {
    const el = document.getElementById('incident-road-grid');
    el.innerHTML = Object.entries(DATA.roadTypes).map(function (entry) {
      const k = entry[0]; const v = entry[1];
      return `<button class="road-btn" data-key="${k}" onclick="selectRoad('${k}')" title="${v.desc}">
        ${v.label}
      </button>`;
    }).join('');
  }

  /* ── Build traffic level buttons ── */
  function buildTrafficLevels() {
    const el = document.getElementById('incident-traffic-grid');
    const levels = [
      { k:'free',     label:'Free-Flow',  color:'#1a7a42' },
      { k:'light',    label:'Light',      color:'#2e9e5c' },
      { k:'moderate', label:'Moderate',   color:'#b86e0a' },
      { k:'heavy',    label:'Heavy',      color:'#c0200f' },
      { k:'peak',     label:'Peak Rush',  color:'#8b0000' },
    ];
    el.innerHTML = levels.map(function (l) {
      return `<button class="traf-btn" data-key="${l.k}" onclick="selectTraffic('${l.k}')"
                style="border-color:${l.color};color:${l.color}">
        ${l.label}
      </button>`;
    }).join('');
  }

  /* ── Selection handlers (exposed globally for onclick) ── */
  window.selectIncident = function (key) {
    state.incident = key;
    document.querySelectorAll('.inc-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector(`.inc-btn[data-key="${key}"]`).classList.add('active');
    trySimulate();
  };

  window.selectRoad = function (key) {
    state.roadType = key;
    document.querySelectorAll('.road-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector(`.road-btn[data-key="${key}"]`).classList.add('active');
    trySimulate();
  };

  window.selectTraffic = function (key) {
    state.trafficLvl = key;
    document.querySelectorAll('.traf-btn').forEach(function (b) { b.classList.remove('active'); });
    document.querySelector(`.traf-btn[data-key="${key}"]`).classList.add('active');
    trySimulate();
  };

  /* ── Simulate when all three selected ── */
  function trySimulate() {
    if (!state.incident || !state.roadType || !state.trafficLvl) {
      document.getElementById('incident-result').style.display = 'none';
      document.getElementById('incident-prompt').style.display = 'block';
      return;
    }
    simulate();
  }

  function simulate() {
    const inc    = DATA.incidents[state.incident];
    const road   = DATA.roadTypes[state.roadType];
    const traf   = state.trafficLvl;

    /* ── Delay calculation ── */
    const baseDelay  = inc.baseDelays[traf];
    const totalDelay = Math.round(baseDelay * road.mult);

    /* ── Queue length (simplified traffic flow theory) ── */
    const demandVph      = DATA.demandVph[traf];
    const residualCap    = Math.round(demandVph * (1 - (inc.capacityLoss || 0.3)));
    const queueGrowthVph = Math.max(0, demandVph - residualCap);
    const clearHrs       = (inc.clearanceMin || 60) / 60;
    const queueVehicles  = Math.round(queueGrowthVph * clearHrs);
    const queueMiles     = (queueVehicles * 0.004).toFixed(1); // ~20 ft/vehicle avg
    const queueFt        = Math.round(queueVehicles * 20);

    /* ── Severity band ── */
    let severity, sev_color, sev_label;
    if (totalDelay <= 10)       { severity = 1; sev_color = '#1a7a42'; sev_label = 'Minor Delay'; }
    else if (totalDelay <= 30)  { severity = 2; sev_color = '#b86e0a'; sev_label = 'Moderate Delay'; }
    else if (totalDelay <= 70)  { severity = 3; sev_color = '#c05200'; sev_label = 'Significant Delay'; }
    else if (totalDelay <= 130) { severity = 4; sev_color = '#c0200f'; sev_label = 'Severe Delay'; }
    else                        { severity = 5; sev_color = '#8b0000'; sev_label = 'Extreme — Avoid'; }

    const pct = Math.min(100, Math.round((totalDelay / 150) * 100));

    /* ── Ripple effect description ── */
    let rippleDesc;
    if (queueMiles < 0.5)      rippleDesc = 'Minimal ripple. Traffic clears within a few blocks.';
    else if (queueMiles < 1.5) rippleDesc = `~${queueMiles} mile queue. Expect stop-and-go for several blocks back.`;
    else if (queueMiles < 4)   rippleDesc = `~${queueMiles} miles of backed-up traffic. Phantom jams may extend further.`;
    else                       rippleDesc = `~${queueMiles}+ miles of severe queue. Cascade effects likely on connecting roads.`;

    /* ── Render ── */
    document.getElementById('incident-prompt').style.display = 'none';
    const res = document.getElementById('incident-result');
    res.style.display = 'block';

    res.innerHTML = `
      <div class="inc-result-header">
        <span class="inc-res-icon"><i data-lucide="${inc.icon}"></i></span>
        <div>
          <div class="inc-res-title">${inc.name}</div>
          <div class="inc-res-sub">${road.label} · ${capitalize(state.trafficLvl)} traffic</div>
        </div>
        <div class="inc-severity-badge" style="background:${sev_color}22;color:${sev_color};border-color:${sev_color}">${sev_label}</div>
      </div>

      <div class="inc-stats-grid">
        <div class="inc-stat">
          <div class="inc-stat-val" style="color:${sev_color}">+${totalDelay} min</div>
          <div class="inc-stat-lbl">Added Delay</div>
        </div>
        <div class="inc-stat">
          <div class="inc-stat-val">${queueMiles} mi</div>
          <div class="inc-stat-lbl">Est. Queue Length</div>
        </div>
        <div class="inc-stat">
          <div class="inc-stat-val">${queueVehicles.toLocaleString()}</div>
          <div class="inc-stat-lbl">Vehicles Affected</div>
        </div>
        <div class="inc-stat">
          <div class="inc-stat-val">${inc.clearanceMin} min</div>
          <div class="inc-stat-lbl">Typical Clearance</div>
        </div>
      </div>

      <div class="inc-delay-bar-wrap">
        <div class="inc-delay-bar-label">
          <span>Delay Severity</span>
          <span style="color:${sev_color}">${pct}%</span>
        </div>
        <div class="inc-delay-bar">
          <div class="inc-delay-fill" style="width:0%;background:${sev_color}"
               id="inc-fill-anim"></div>
        </div>
      </div>

      <div class="inc-section-label">Ripple Effect</div>
      <div class="inc-body-box">${rippleDesc}</div>

      <div class="inc-section-label">What Drivers Will Experience</div>
      <div class="inc-body-box">${inc.desc}</div>

      <div class="inc-section-label">What You Should Do</div>
      <ul class="inc-action-list">
        ${inc.actions.map(function (a) { return `<li>${a}</li>`; }).join('')}
      </ul>

      <div class="inc-section-label">Alternate Strategy</div>
      <div class="inc-body-box inc-alt">${inc.alternate}</div>
    `;

    if (window.lucide) window.lucide.createIcons();

    /* Animate fill bar */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        const fill = document.getElementById('inc-fill-anim');
        if (fill) fill.style.width = pct + '%';
      });
    });
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ── Init ── */
  buildIncidentTypes();
  buildRoadTypes();
  buildTrafficLevels();
  if (window.lucide) window.lucide.createIcons();
})();
