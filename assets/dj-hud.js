/* ============================================================
   dj-hud.js — "See what the DJ is doing" floating video widget
   Loads on Portfolio + Room pages (NOT the intro). Plays a looping
   DJ-set clip under the top bar. Muted autoplay by default (browser
   rule); click to unmute. Position + time + mute persist across
   page loads via localStorage so it feels continuous.
   ============================================================ */
(function () {
  if (window.__djHud) return; window.__djHud = true;
  var SRC = 'assets/dj-set.mp4';

  var box = document.createElement('div');
  box.id = 'djHud';
  box.innerHTML =
    '<div class="dj-head"><span class="dj-dot"></span><span class="dj-title">See what the DJ is doing</span>' +
      '<button class="dj-mini" aria-label="Minimize">\u2013</button></div>' +
    '<div class="dj-body">' +
      '<video class="dj-vid" src="' + SRC + '" muted loop playsinline preload="metadata"></video>' +
      '<button class="dj-unmute" aria-label="Unmute">' +
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2"/></svg>' +
        '<span>Tap for sound</span></button>' +
    '</div>' +
    '<div class="dj-vol"><svg viewBox="0 0 24 24" width="13" height="13" fill="rgba(255,255,255,0.85)"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>' +
      '<input class="dj-slider" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Volume"></div>';
  document.body.appendChild(box);

  var css = document.createElement('style');
  css.textContent =
    '#djHud{position:fixed;top:86px;right:18px;z-index:80;width:230px;border-radius:14px;overflow:hidden;' +
      'background:rgba(12,14,20,0.62);-webkit-backdrop-filter:blur(16px) saturate(1.3);backdrop-filter:blur(16px) saturate(1.3);' +
      'border:1px solid rgba(255,255,255,0.18);box-shadow:0 18px 50px rgba(0,0,0,0.45);transition:width .25s,height .25s;}' +
    '#djHud.mini .dj-body{display:none;}' +
    '#djHud .dj-head{display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:grab;user-select:none;}' +
    '#djHud .dj-dot{width:8px;height:8px;border-radius:50%;background:#f5b21a;box-shadow:0 0 8px #f5b21a;flex:0 0 auto;animation:djpulse 1.6s infinite;}' +
    '@keyframes djpulse{0%,100%{opacity:1}50%{opacity:.4}}' +
    '#djHud .dj-title{font-family:var(--font-sans,Helvetica,Arial,sans-serif);font-size:0.78rem;color:#fff;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#djHud .dj-mini{background:none;border:0;color:rgba(255,255,255,0.7);font-size:1rem;cursor:pointer;line-height:1;padding:0 2px;}' +
    '#djHud .dj-body{position:relative;}' +
    '#djHud .dj-vid{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;background:#000;}' +
    '#djHud .dj-unmute{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);display:flex;align-items:center;gap:7px;' +
      'background:rgba(0,0,0,0.55);border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:999px;padding:6px 13px;font-size:0.76rem;cursor:pointer;}' +
    '#djHud .dj-unmute:hover{background:rgba(0,0,0,0.75);}' +
    '#djHud.sound .dj-unmute{display:none;}' +
    '#djHud .dj-vol{display:flex;align-items:center;gap:8px;padding:8px 12px 10px;}' +
    '#djHud .dj-slider{-webkit-appearance:none;appearance:none;flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,0.25);outline:none;cursor:pointer;}' +
    '#djHud .dj-slider::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:#f5b21a;cursor:pointer;}' +
    '#djHud .dj-slider::-moz-range-thumb{width:11px;height:11px;border:0;border-radius:50%;background:#f5b21a;cursor:pointer;}' +
    '@media(max-width:640px){#djHud{width:170px;top:74px;right:10px;}}' +
    '@media print{#djHud{display:none!important;}}';
  document.head.appendChild(css);

  var vid = box.querySelector('.dj-vid');
  var unmute = box.querySelector('.dj-unmute');
  var slider = box.querySelector('.dj-slider');

  // volume slider → sets volume + unmutes on use
  vid.volume = 0.8;
  slider.addEventListener('input', function (e) {
    e.stopPropagation();
    vid.volume = parseFloat(slider.value);
    if (parseFloat(slider.value) > 0) { vid.muted = false; box.classList.add('sound'); }
    try { localStorage.setItem('djHudVol', slider.value); } catch (e2) {}
  });
  slider.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  try { var sv = localStorage.getItem('djHudVol'); if (sv !== null) { slider.value = sv; vid.volume = parseFloat(sv); } } catch (e) {}

  // restore state
  try {
    var t = parseFloat(localStorage.getItem('djHudTime') || '0');
    if (t > 0) vid.addEventListener('loadedmetadata', function () { try { vid.currentTime = t % (vid.duration || 1); } catch (e) {} }, { once: true });
    if (localStorage.getItem('djHudMini') === '1') box.classList.add('mini');
  } catch (e) {}

  vid.play().catch(function () {});
  setInterval(function () { try { localStorage.setItem('djHudTime', vid.currentTime); } catch (e) {} }, 1000);

  function enableSound() {
    vid.muted = false; box.classList.add('sound');
    vid.play().catch(function () {});
    try { localStorage.setItem('djHudSound', '1'); } catch (e) {}
  }
  unmute.addEventListener('click', function (e) { e.stopPropagation(); enableSound(); });
  // honor prior unmute choice (still needs a gesture, so just show the button is hidden once they pick sound)

  box.querySelector('.dj-mini').addEventListener('click', function (e) {
    e.stopPropagation();
    box.classList.toggle('mini');
    try { localStorage.setItem('djHudMini', box.classList.contains('mini') ? '1' : '0'); } catch (e2) {}
  });

  // drag to reposition
  var head = box.querySelector('.dj-head');
  var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
  head.addEventListener('pointerdown', function (e) {
    if (e.target.classList.contains('dj-mini')) return;
    dragging = true; sx = e.clientX; sy = e.clientY;
    var r = box.getBoundingClientRect(); ox = r.left; oy = r.top;
    box.style.right = 'auto'; head.style.cursor = 'grabbing';
  });
  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    box.style.left = Math.max(6, Math.min(window.innerWidth - box.offsetWidth - 6, ox + e.clientX - sx)) + 'px';
    box.style.top = Math.max(6, Math.min(window.innerHeight - box.offsetHeight - 6, oy + e.clientY - sy)) + 'px';
  });
  window.addEventListener('pointerup', function () { dragging = false; head.style.cursor = 'grab'; });
})();
