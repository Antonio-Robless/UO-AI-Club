/* ─────────────────────────────────────────────────────────────
   tips.js  —  Filterable Tips Library
───────────────────────────────────────────────────────────── */

(function () {
  const TAG_META = {
    all:     { label:'All Tips',  color:'var(--text)' },
    time:    { label:'Timing',    color:'var(--accent)' },
    route:   { label:'Routing',   color:'var(--green)' },
    fuel:    { label:'Fuel',      color:'var(--yellow)' },
    parking: { label:'Parking',   color:'var(--accent2)' },
    stress:  { label:'Stress',    color:'var(--red)' },
  };

  let activeTag = 'all';

  window.filterTips = function (tag) {
    activeTag = tag;
    render();
  };

  function render() {
    /* Filter buttons */
    const filterEl = document.getElementById('tips-filter');
    filterEl.innerHTML = Object.entries(TAG_META).map(function (entry) {
      const k = entry[0]; const v = entry[1];
      return `<button class="btn ${k === activeTag ? 'active' : ''}"
                onclick="filterTips('${k}')">${v.label}</button>`;
    }).join('');

    /* Tips */
    const listEl   = document.getElementById('tips-list');
    const filtered = activeTag === 'all'
      ? DATA.tips
      : DATA.tips.filter(function (t) { return t.tag === activeTag; });

    const tagColors = {
      time:    'var(--accent)',
      route:   'var(--green)',
      fuel:    'var(--yellow)',
      parking: 'var(--accent2)',
      stress:  'var(--red)',
    };

    listEl.innerHTML = filtered.map(function (t) {
      const color = tagColors[t.tag];
      return `<div class="tip-card">
        <div class="tip-dot" style="background:${color}"></div>
        <div class="tip-inner">
          <div class="tip-tag" style="color:${color}">${t.label}</div>
          <div class="tip-text">${t.text}</div>
        </div>
      </div>`;
    }).join('');
  }

  render();
})();
