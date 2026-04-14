/* ─────────────────────────────────────────────────────────────
   estimator.js  —  Trip Cost / Time Estimator
───────────────────────────────────────────────────────────── */

function calcFuel() {
  const dist  = parseFloat(document.getElementById('f-dist').value)  || 0;
  const mpg   = parseFloat(document.getElementById('f-mpg').value)   || 30;
  const price = parseFloat(document.getElementById('f-price').value) || 3.79;
  const traf  = document.getElementById('f-traffic').value;

  const speed  = DATA.trafficSpeeds[traf];
  const mult   = DATA.trafficMpgMult[traf];

  const effectiveMpg = mpg * mult;
  const fuelUsed     = dist / effectiveMpg;
  const cost         = fuelUsed * price;
  const minutes      = (dist / speed) * 60;
  const freeMins     = (dist / DATA.trafficSpeeds.free) * 60;
  const penaltyMins  = minutes - freeMins;

  const fmt    = function (n) { return n < 10 ? n.toFixed(2) : n.toFixed(1); };
  const fmtMin = function (m) {
    return m < 60 ? `${Math.round(m)} min` : `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`;
  };

  document.getElementById('r-time').textContent    = fmtMin(minutes);
  document.getElementById('r-fuel').textContent    = fmt(fuelUsed) + ' gal';
  document.getElementById('r-cost').textContent    = '$' + cost.toFixed(2);
  document.getElementById('r-penalty').textContent = penaltyMins > 0.5
    ? '+' + fmtMin(penaltyMins) + ' vs free-flow'
    : 'None';
  document.getElementById('r-tip').textContent     = DATA.trafficTips[traf];
  document.getElementById('fuel-result').style.display = 'block';
}
