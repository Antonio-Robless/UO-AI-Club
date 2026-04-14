/* ─────────────────────────────────────────────────────────────
   map.js — Section 05 Live Map
   Google Maps JS API + Traffic layer + TomTom incident markers
───────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var API_BASE    = 'http://localhost:8080/api';
  var DEFAULT_LAT = 44.0521;
  var DEFAULT_LON = -123.0868;
  var mapInstance = null;
  var incidentMarkers = [];
  var searchBox = null;
  var userMarker = null;

  var SEVERITY_COLORS = ['#6b7280', '#6ee7b7', '#fbbf24', '#f97316', '#ef4444', '#991b1b'];
  var TYPE_ICONS = {
    'ACCIDENT':    '🚨',
    'JAM':         '🚗',
    'ROAD_WORK':   '🚧',
    'LANE_CLOSED': '🔒',
    'ROAD_CLOSED': '⛔',
    'WEATHER':     '🌧️',
  };

  // Called by Google Maps JS API once loaded
  window.initLiveMap = function () {
    var mapEl = document.getElementById('live-map-canvas');
    if (!mapEl) return;

    mapInstance = new google.maps.Map(mapEl, {
      zoom: 13,
      center: { lat: DEFAULT_LAT, lng: DEFAULT_LON },
      mapTypeId: 'roadmap',
      styles: mapStyles(),
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
    });

    // Traffic layer — green/yellow/red roads
    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(mapInstance);

    // Search box
    initSearchBox();

    // Status label
    setMapStatus('Detecting your location…');

    // GPS → center + fetch incidents
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          centerOnUser(lat, lng);
          fetchAndPlotIncidents(lat, lng);
        },
        function () {
          setMapStatus('Using default location (GPS denied)');
          fetchAndPlotIncidents(DEFAULT_LAT, DEFAULT_LON);
        },
        { timeout: 6000, maximumAge: 300000 }
      );
    } else {
      setMapStatus('GPS not available — using default location');
      fetchAndPlotIncidents(DEFAULT_LAT, DEFAULT_LON);
    }
  };

  function centerOnUser(lat, lng) {
    mapInstance.setCenter({ lat: lat, lng: lng });

    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: mapInstance,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#0066ff',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      zIndex: 999,
    });
    setMapStatus('Live traffic · GPS location active');
  }

  // ── Search Box ───────────────────────────────────────────────
  function initSearchBox() {
    var input = document.getElementById('map-search-input');
    if (!input || !google.maps.places) return;

    searchBox = new google.maps.places.Autocomplete(input, {
      fields: ['geometry', 'name'],
    });

    searchBox.addListener('place_changed', function () {
      var place = searchBox.getPlace();
      if (!place.geometry || !place.geometry.location) return;
      mapInstance.setCenter(place.geometry.location);
      mapInstance.setZoom(14);
      var lat = place.geometry.location.lat();
      var lng = place.geometry.location.lng();
      centerOnUser(lat, lng);
      fetchAndPlotIncidents(lat, lng);
    });
  }

  // ── Incident markers ─────────────────────────────────────────
  function fetchAndPlotIncidents(lat, lon) {
    fetch(API_BASE + '/traffic/incidents?lat=' + lat + '&lon=' + lon + '&radius=8')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        plotIncidents(data.incidents || []);
        var count = (data.incidents || []).filter(function(i){ return i.lat && i.lon; }).length;
        if (count > 0) {
          setMapStatus('Live traffic · ' + count + ' nearby incident' + (count === 1 ? '' : 's'));
        }
      })
      .catch(function () {
        setMapStatus('Live traffic · incident data unavailable (start server.py)');
      });
  }

  function plotIncidents(incidents) {
    // Clear old markers
    incidentMarkers.forEach(function (m) { m.setMap(null); });
    incidentMarkers = [];

    incidents.forEach(function (inc) {
      if (inc.lat == null || inc.lon == null) return;

      var sev   = Math.min(5, Math.max(0, inc.severity || 0));
      var color = SEVERITY_COLORS[sev];
      var icon  = TYPE_ICONS[inc.type] || '⚠️';
      var delay = inc.delay > 60
        ? Math.round(inc.delay / 60) + ' min delay'
        : (inc.delay ? inc.delay + 's delay' : '');

      var marker = new google.maps.Marker({
        position: { lat: inc.lat, lng: inc.lon },
        map: mapInstance,
        title: inc.description,
        label: {
          text: icon,
          fontSize: '16px',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: color,
          fillOpacity: 0.92,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 100,
      });

      var infoContent =
        '<div style="font-family:Inter,sans-serif;max-width:220px;padding:2px 0">' +
        '<div style="font-size:0.85rem;font-weight:700;margin-bottom:4px">' + icon + ' ' + inc.description + '</div>' +
        '<div style="font-size:0.75rem;color:#64748b">' +
        (inc.roadName ? inc.roadName + '<br>' : '') +
        (delay ? delay + '<br>' : '') +
        '</div></div>';

      var infoWindow = new google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', function () {
        infoWindow.open(mapInstance, marker);
      });

      incidentMarkers.push(marker);
    });
  }

  // ── Status label ─────────────────────────────────────────────
  function setMapStatus(text) {
    var el = document.getElementById('map-status-text');
    if (el) el.textContent = text;
  }

  // ── Subtle map styles (keeps color-coded traffic visible) ────
  function mapStyles() {
    return [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ];
  }

})();
