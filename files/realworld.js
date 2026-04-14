/* ─────────────────────────────────────────────────────────────
   realworld.js  —  Real-World Traffic Impact Cards
───────────────────────────────────────────────────────────── */

(function () {
  const CATS = {
    all:       { label: 'All',              color: 'var(--text)' },
    economic:  { label: 'Economic Impact',  color: 'var(--yellow)' },
    health:    { label: 'Health & Env.',    color: 'var(--green)' },
    emergency: { label: 'Emergency Svc.',   color: 'var(--red)' },
    events:    { label: 'Notable Events',   color: 'var(--accent2)' },
    cities:    { label: 'City Spotlights',  color: 'var(--accent)' },
  };

  const CAT_COLORS = {
    economic:  'var(--yellow)',
    health:    'var(--green)',
    emergency: 'var(--red)',
    events:    'var(--accent2)',
    cities:    'var(--accent)',
  };

  let activeTab = 'all';

  window.filterRealWorld = function (cat) {
    activeTab = cat;
    render();
  };

  function render() {
    /* Tab bar */
    const tabsEl = document.getElementById('rw-tabs');
    tabsEl.innerHTML = Object.entries(CATS).map(function (entry) {
      const k = entry[0]; const v = entry[1];
      return `<button class="btn ${k === activeTab ? 'active' : ''}"
                onclick="filterRealWorld('${k}')">${v.label}</button>`;
    }).join('');

    /* Cards */
    const cardsEl  = document.getElementById('rw-cards');
    const filtered = activeTab === 'all'
      ? DATA.realWorld
      : DATA.realWorld.filter(function (d) { return d.cat === activeTab; });

    cardsEl.innerHTML = filtered.map(function (d) {
      const accent = CAT_COLORS[d.cat] || 'var(--accent)';
      return `
        <div class="rw-card" style="border-top-color:${accent}">
          <div class="rw-card-top">
            <span class="rw-icon"><i data-lucide="${d.icon}"></i></span>
            <div class="rw-stat" style="color:${accent}">${d.stat}</div>
          </div>
          <div class="rw-title">${d.title}</div>
          <div class="rw-body">${d.body}</div>
          <div class="rw-source">Source: ${d.source}</div>
        </div>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
  }

  render();
})();
