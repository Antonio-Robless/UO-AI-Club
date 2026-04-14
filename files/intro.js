/* ─────────────────────────────────────────────────────────────
   intro.js  —  Page-load "angry traffic" transition
───────────────────────────────────────────────────────────── */

(function () {
  var TOTAL_MS  = 3400; // ms before "route found" triggers
  var EXIT_MS   = TOTAL_MS + 380;  // cars start zooming
  var SLIDE_MS  = TOTAL_MS + 720;  // overlay slides up
  var DONE_MS   = TOTAL_MS + 1700; // overlay removed

  var CAR_COLORS = [
    '#b4bdd0', '#ccd4e4', '#9aa4b8', '#dce4f0', // silvers / whites
    '#1e2538', '#28304a', '#363e50', '#222a3a',  // charcoal darks
    '#5e2828', '#7c3232', '#8a2020',             // reds
    '#1c3060', '#243e6e', '#1a2a50',             // blues
    '#3a2a4c', '#4c3e64',                        // purples
    '#2a3c28', '#3c5030',                        // dark greens
    '#4a3818', '#5c4820',                        // tans / browns
  ];

  var HONKS = [
    'HONK!', 'BEEP!', 'MOVE IT!', 'HONK HONK', 'C\'MON!!',
    '🔊 HONK', 'GO!', '!!', 'COME ON!', 'SERIOUSLY?!'
  ];

  /* ── Utilities ── */
  function rand(a, b)    { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b)); }
  function pick(arr)     { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── Fill a lane with bumper-to-bumper cars ── */
  function fillLane(laneEl, laneIdx) {
    var laneW = laneEl.getBoundingClientRect().width || 660;
    var x     = -randInt(20, 80); // start some cars slightly off left edge
    var idx   = 0;

    while (x < laneW + 100) {
      var w         = randInt(56, 78);
      var creepPx   = randInt(18, 24);
      var dur       = rand(2.5, 4.5).toFixed(2);
      // Stagger go-animation: left-most cars go first so it looks like a wave
      var goDelay   = (idx * 0.030 + laneIdx * 0.048).toFixed(3);
      var gap       = randInt(12, 20);
      var color     = pick(CAR_COLORS);
      var bDelay    = rand(0, 1.1).toFixed(2); // brake light phase offset

      var car = document.createElement('div');
      car.className = 'intro-car creeping';
      car.style.cssText =
        'left:'       + x         + 'px;'  +
        'width:'      + w         + 'px;'  +
        'background:' + color     + ';'    +
        '--creep:'    + creepPx   + 'px;'  +
        '--dur:'      + dur       + 's;'   +
        '--go-delay:' + goDelay   + 's;';

      car.innerHTML =
        '<div class="c-roof"></div>' +
        '<div class="c-brake" style="animation-delay:' + bDelay + 's"></div>' +
        '<div class="c-light"></div>';

      laneEl.appendChild(car);
      x   += w + gap;
      idx += 1;
    }
  }

  /* ── Drop a honk bubble somewhere on the road ── */
  function spawnHonk(road) {
    var bubble = document.createElement('div');
    bubble.className = 'honk';
    bubble.textContent = pick(HONKS);
    bubble.style.left = randInt(28, road.offsetWidth - 90) + 'px';
    bubble.style.top  = randInt(4, road.offsetHeight - 18) + 'px';
    road.appendChild(bubble);
    setTimeout(function () { if (bubble.parentNode) bubble.remove(); }, 1250);
  }

  /* ── Main ── */
  function init() {
    var overlay = document.getElementById('traffic-intro');
    var road    = document.getElementById('intro-road');
    var badge   = document.getElementById('intro-badge');
    var title   = document.getElementById('intro-title');
    var msg     = document.getElementById('intro-msg');
    var fill    = document.getElementById('intro-fill');
    var pct     = document.getElementById('intro-pct');

    if (!overlay) return; // already removed or not present

    document.body.classList.add('intro-active');

    /* Generate cars after first paint so offsetWidth is reliable */
    requestAnimationFrame(function () {
      for (var i = 0; i < 3; i++) {
        var lane = document.getElementById('intro-lane-' + i);
        if (lane) fillLane(lane, i);
      }
    });

    /* Honk interval — one burst every 620–950ms (random feel) */
    var nextHonk = function () {
      if (!document.getElementById('traffic-intro')) return;
      spawnHonk(road);
      honkTimer = setTimeout(nextHonk, randInt(550, 950));
    };
    var honkTimer = setTimeout(nextHonk, 400);

    /* Progress bar — rAF-driven so it's frame-accurate */
    var t0 = performance.now();
    var animFrame;
    function tickProgress(now) {
      var elapsed = now - t0;
      var p = Math.min(100, Math.round((elapsed / TOTAL_MS) * 100));
      if (fill) fill.style.width = p + '%';
      if (pct)  pct.textContent  = p + '%';
      if (p < 100) {
        animFrame = requestAnimationFrame(tickProgress);
      }
    }
    animFrame = requestAnimationFrame(tickProgress);

    /* ── Phase 2: Route found ── */
    setTimeout(function () {
      clearTimeout(honkTimer);
      cancelAnimationFrame(animFrame);

      if (fill)  fill.style.transition = 'width 0.35s ease';
      if (fill)  fill.style.width      = '100%';
      if (pct)   { pct.textContent = '100%'; pct.classList.add('found'); }
      if (badge) { badge.textContent = '🟢 ROUTE FOUND'; badge.classList.add('found'); }
      if (title) title.textContent = 'ESCAPE ROUTE CALCULATED';
      if (msg)   { msg.textContent = 'Opening your dashboard...'; msg.classList.add('found'); }
    }, TOTAL_MS);

    /* ── Phase 3: Cars suddenly go ── */
    setTimeout(function () {
      document.querySelectorAll('.intro-car').forEach(function (car) {
        car.classList.remove('creeping');
        car.classList.add('go');
      });
    }, EXIT_MS);

    /* ── Phase 4: Overlay slides up ── */
    setTimeout(function () {
      overlay.classList.add('intro-exit');
    }, SLIDE_MS);

    /* ── Cleanup ── */
    setTimeout(function () {
      if (overlay.parentNode) overlay.remove();
      document.body.classList.remove('intro-active');
    }, DONE_MS);
  }

  /* Start after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
