/* ============================================================
   music-hud.js  —  persistent cross-page music player + HUD bar
   ------------------------------------------------------------
   • Add your 5-min mixes in the MIXES array below (drop the files
     in assets/mixes/ and set `src`). Until a src is set, that mix
     shows as "coming soon".
   • The HUD bar appears on every page that loads this script and
     resumes the current mix + position from localStorage, so music
     carries across Portfolio / Room / case-study pages.
   • window.MusicHUD API: .play(mixId) .toggle() .pause() .stop()
   • Call window.MusicHUD.pause() before playing other audio
     (e.g. the Favorite-Music previews) so they never overlap.
   ============================================================ */
(function () {
  if (window.MusicHUD) return;

  var MIXES = [
    { id: 'mix1', name: 'Sunrise Set',   sub: 'DJ mix · ~5 min', src: '' },
    { id: 'mix2', name: 'Late Night',    sub: 'DJ mix · ~5 min', src: '' },
    { id: 'mix3', name: 'Build Mode',    sub: 'DJ mix · ~5 min', src: '' },
    { id: 'mix4', name: 'Golden Hour',   sub: 'DJ mix · ~5 min', src: '' },
    { id: 'mix5', name: 'Encore',        sub: 'DJ mix · ~5 min', src: '' }
  ];
  var LS = 'nishMusicState';
  function readState() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function writeState(s) { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) {} }

  var audio = new Audio();
  audio.preload = 'auto';
  var cur = null;       // current mix object
  var saveTimer = 0;

  /* ---- HUD markup ---- */
  var hud = document.createElement('div');
  hud.id = 'musicHud';
  hud.innerHTML =
    '<button class="mh-btn mh-play" aria-label="Play/Pause">\u25B6</button>' +
    '<div class="mh-meta"><div class="mh-name"></div><div class="mh-bar"><div class="mh-fill"></div></div></div>' +
    '<div class="mh-time">0:00</div>' +
    '<button class="mh-btn mh-stop" aria-label="Stop">\u2715</button>';
  var style = document.createElement('style');
  style.textContent =
    '#musicHud{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(140%);z-index:120;display:flex;align-items:center;gap:12px;' +
      'background:rgba(12,13,18,0.62);-webkit-backdrop-filter:blur(20px) saturate(1.4);backdrop-filter:blur(20px) saturate(1.4);' +
      'border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:8px 14px 8px 8px;box-shadow:0 14px 44px rgba(0,0,0,0.45);' +
      'width:min(340px,calc(100vw - 32px));transition:transform .4s cubic-bezier(.5,1.3,.5,1);font-family:"Helvetica Neue",Arial,sans-serif;}' +
    '#musicHud.show{transform:translateX(-50%) translateY(0);}' +
    '#musicHud .mh-btn{flex:0 0 auto;border:0;cursor:pointer;color:#fff;background:rgba(255,255,255,0.14);border-radius:50%;display:grid;place-items:center;}' +
    '#musicHud .mh-play{width:38px;height:38px;font-size:14px;background:#f5b21a;color:#1a1205;}' +
    '#musicHud .mh-stop{width:26px;height:26px;font-size:12px;}' +
    '#musicHud .mh-meta{flex:1 1 auto;min-width:0;}' +
    '#musicHud .mh-name{color:#fff;font-size:0.84rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '#musicHud .mh-bar{height:4px;border-radius:2px;background:rgba(255,255,255,0.2);margin-top:6px;overflow:hidden;cursor:pointer;}' +
    '#musicHud .mh-fill{height:100%;width:0;background:#f5b21a;border-radius:2px;}' +
    '#musicHud .mh-time{flex:0 0 auto;color:rgba(255,255,255,0.7);font-size:0.72rem;min-width:32px;text-align:right;}';
  document.head.appendChild(style);
  function mount() { if (!document.body) return setTimeout(mount, 50); document.body.appendChild(hud); restore(); }
  mount();

  var playBtn = hud.querySelector('.mh-play'),
      nameEl = hud.querySelector('.mh-name'),
      fillEl = hud.querySelector('.mh-fill'),
      timeEl = hud.querySelector('.mh-time'),
      barEl = hud.querySelector('.mh-bar');

  function fmt(t) { t = t || 0; var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }
  function show() { hud.classList.add('show'); }

  function loadMix(mix, startAt, autoplay) {
    cur = mix; nameEl.textContent = mix.name;
    if (!mix.src) { nameEl.textContent = mix.name + ' (coming soon)'; show(); return; }
    if (audio.src !== mix.src) audio.src = mix.src;
    if (startAt) { try { audio.currentTime = startAt; } catch (e) {} }
    show();
    if (autoplay) audio.play().then(persist).catch(function(){ playBtn.textContent = '\u25B6'; });
  }
  function play(mixId) {
    var mix = MIXES.filter(function (m) { return m.id === mixId; })[0]; if (!mix) return;
    if (window.__previewAudio) try { window.__previewAudio.pause(); } catch (e) {}
    loadMix(mix, cur && cur.id === mixId ? audio.currentTime : 0, true);
  }
  function toggle() { if (!cur) return; if (audio.paused) audio.play().catch(function(){}); else audio.pause(); }
  function pause() { audio.pause(); }
  function stop() { audio.pause(); audio.currentTime = 0; hud.classList.remove('show'); var s = readState(); s.playing = false; s.time = 0; writeState(s); }

  playBtn.addEventListener('click', toggle);
  hud.querySelector('.mh-stop').addEventListener('click', stop);
  barEl.addEventListener('click', function (e) { if (!cur || !audio.duration) return; var r = barEl.getBoundingClientRect(); audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration; });

  audio.addEventListener('play', function () { playBtn.textContent = '\u275A\u275A'; persist(); });
  audio.addEventListener('pause', function () { playBtn.textContent = '\u25B6'; persist(); });
  audio.addEventListener('timeupdate', function () {
    if (audio.duration) { fillEl.style.width = (audio.currentTime / audio.duration * 100) + '%'; timeEl.textContent = fmt(audio.currentTime); }
    if (Date.now() - saveTimer > 1500) { saveTimer = Date.now(); persist(); }
  });
  audio.addEventListener('ended', function () { persist(); });

  function persist() { if (!cur) return; writeState({ mixId: cur.id, time: audio.currentTime, playing: !audio.paused }); }
  window.addEventListener('beforeunload', persist);

  function restore() {
    var s = readState();
    if (!s.mixId) return;
    var mix = MIXES.filter(function (m) { return m.id === s.mixId; })[0]; if (!mix) return;
    // resume position; try to autoplay if it was playing (may be blocked until a click)
    loadMix(mix, s.time || 0, !!s.playing);
  }

  window.MusicHUD = { play: play, toggle: toggle, pause: pause, stop: stop, mixes: MIXES };
})();
