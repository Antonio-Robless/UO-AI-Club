/* ─────────────────────────────────────────────────────────────
   decision.js  —  Route Decision Helper
───────────────────────────────────────────────────────────── */

(function () {
  const sel = { dist: null, time: null, prio: null };

  document.querySelectorAll('.btn[data-group]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const g = this.dataset.group;
      document.querySelectorAll(`.btn[data-group="${g}"]`)
        .forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      sel[g] = this.dataset.val;
      render();
    });
  });

  function render() {
    const el = document.getElementById('decision-result');
    if (!sel.dist || !sel.time || !sel.prio) { el.style.display = 'none'; return; }
    const advice = DATA.decisions[sel.dist][sel.time][sel.prio];
    const labels = { speed: 'Fastest Route', fuel: 'Fuel Efficiency', stress: 'Least Stress' };
    el.style.display = 'block';
    el.innerHTML = `<h4>${labels[sel.prio]} Recommendation</h4><p>${advice}</p>`;
  }
})();
