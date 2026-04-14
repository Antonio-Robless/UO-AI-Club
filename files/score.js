/* ─────────────────────────────────────────────────────────────
   score.js  —  Efficiency Score Builder
───────────────────────────────────────────────────────────── */

(function () {
  function buildScoreSliders() {
    const wrap = document.getElementById('score-wrap');
    DATA.scoreFactors.forEach(function (f) {
      wrap.innerHTML += `
        <div class="score-item">
          <label>${f.label} — ${f.desc}<span id="sv-${f.id}">5</span>/10</label>
          <div class="score-bar">
            <div class="score-fill" id="sf-${f.id}" style="width:50%;background:var(--accent)"></div>
          </div>
          <input type="range" min="1" max="10" value="5"
            style="width:100%;margin-top:4px;accent-color:var(--accent)"
            oninput="updateScore('${f.id}', this.value)" />
        </div>`;
    });
    updateOverall();
  }

  window.updateScore = function (id, val) {
    document.getElementById('sv-' + id).textContent = val;
    const pct  = (val / 10) * 100;
    const fill = document.getElementById('sf-' + id);
    fill.style.width      = pct + '%';
    fill.style.background = pct < 35 ? 'var(--red)' : pct < 60 ? 'var(--yellow)' : 'var(--green)';
    updateOverall();
  };

  function updateOverall() {
    const inputs = document.querySelectorAll('#score-wrap input[type=range]');
    let sum = 0;
    inputs.forEach(function (i) { sum += parseInt(i.value); });
    const score = Math.round((sum / (DATA.scoreFactors.length * 10)) * 100);
    const el    = document.getElementById('score-num');
    el.textContent = score;
    const color = score < 40 ? 'var(--red)' : score < 65 ? 'var(--yellow)' : 'var(--green)';
    el.style.background = `linear-gradient(135deg, ${color}, var(--accent))`;
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
  }

  buildScoreSliders();
})();
