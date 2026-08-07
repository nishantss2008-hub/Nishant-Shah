/* ============================================================
   dj-hud.js — the spinning record
   ------------------------------------------------------------
   A vinyl record that turns quietly in the corner of the
   Portfolio + Room pages (NOT the intro). Click it and a small
   circular video opens over the label — the DJ set, with sound,
   since the click is the gesture the browser wants. Click again
   to stop and let the record close back up.

   Add data-autostart to the script tag (Portfolio does) and the
   clip starts on load instead. Browsers only permit autoplay
   while muted, so it opens silent and one click adds sound. An
   explicit stop is remembered and suppresses the next autostart.

   The clip is only fetched on first play, and playback position
   + volume persist across page loads via localStorage so it
   feels like the same record kept spinning while you browsed.
   Drag the record to move it out of the way.

   window.DJVinyl API: .play() .pause() .toggle() .playing()
   ============================================================ */
(function () {
  if (window.__djHud) return; window.__djHud = true;
  var SRC = 'assets/dj-set.mp4';
  var DRAG_SLOP = 5; // px of movement before a click counts as a drag instead
  // <script src="assets/dj-hud.js" data-autostart> → record starts spinning the clip on load
  var AUTOSTART = !!(document.currentScript && document.currentScript.hasAttribute('data-autostart'));

  /* ---------- markup ---------- */
  var box = document.createElement('div');
  box.id = 'djVinyl';
  box.setAttribute('role', 'button');
  box.setAttribute('tabindex', '0');
  box.setAttribute('aria-label', 'See what the DJ is doing');
  box.innerHTML =
    '<div class="dj-disc">' +
      '<div class="dj-label"></div>' +
      '<div class="dj-hole"></div>' +
    '</div>' +
    '<div class="dj-sheen"></div>' +
    '<div class="dj-screen"><video class="dj-vid" loop playsinline preload="none"></video></div>' +
    '<div class="dj-cue"><span class="dj-dot"></span><span class="dj-cue-text">See what the DJ is doing</span></div>';

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    /* the drop shadow lives on the container, NOT on the spinning disc — on the disc
       its offset would orbit with the rotation instead of staying put underneath */
    '#djVinyl{position:fixed;top:86px;right:18px;z-index:80;width:148px;height:148px;cursor:pointer;' +
      'border-radius:50%;box-shadow:0 18px 44px rgba(0,0,0,0.55);' +
      'touch-action:none;-webkit-tap-highlight-color:transparent;' +
      'transition:width .35s cubic-bezier(.3,1.2,.4,1),height .35s cubic-bezier(.3,1.2,.4,1);}' +
    '#djVinyl.playing{width:196px;height:196px;}' +
    '#djVinyl.dragging{cursor:grabbing;}' +
    '#djVinyl:focus-visible{outline:2px solid #f5b21a;outline-offset:7px;border-radius:50%;}' +

    /* the record — grooves, spinning */
    '#djVinyl .dj-disc{position:absolute;inset:0;border-radius:50%;' +
      'background:repeating-radial-gradient(circle at 50% 50%,rgba(255,255,255,0.05) 0 1px,rgba(255,255,255,0) 1px 4px),' +
      'radial-gradient(circle at 50% 50%,#1b1c22 0 30%,#101116 30% 74%,#16171d 74% 100%);' +
      'box-shadow:inset 0 0 0 1px rgba(255,255,255,0.09);' + /* inset ring only — symmetric, so it can rotate */
      'animation:djSpin 3.4s linear infinite;}' +
    '#djVinyl.playing .dj-disc{animation-duration:1.9s;}' +
    '@keyframes djSpin{to{transform:rotate(360deg);}}' +

    /* centre label + spindle hole */
    '#djVinyl .dj-label{position:absolute;left:50%;top:50%;width:38%;height:38%;transform:translate(-50%,-50%);' +
      'border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.3);' +
      'background:conic-gradient(from 210deg,#6f8cff,#a78bfa 28%,#ff9a6a 58%,#f5b21a 78%,#6f8cff);}' +
    '#djVinyl .dj-hole{position:absolute;left:50%;top:50%;width:7%;height:7%;transform:translate(-50%,-50%);' +
      'border-radius:50%;background:#0a0b10;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.2);}' +

    /* fixed highlight so the record reads as a glossy surface, not a spinning texture */
    '#djVinyl .dj-sheen{position:absolute;inset:0;border-radius:50%;pointer-events:none;' +
      'background:linear-gradient(125deg,rgba(255,255,255,0.17) 0%,rgba(255,255,255,0) 36%,' +
      'rgba(255,255,255,0) 64%,rgba(255,255,255,0.09) 100%);}' +

    /* the little circular screen over the label — does not spin */
    '#djVinyl .dj-screen{position:absolute;left:50%;top:50%;width:56%;height:56%;' +
      'transform:translate(-50%,-50%) scale(.35);border-radius:50%;overflow:hidden;background:#000;' +
      'opacity:0;pointer-events:none;' +
      'box-shadow:0 0 0 3px rgba(10,11,16,0.92),0 0 0 4px rgba(255,255,255,0.22),0 10px 26px rgba(0,0,0,0.5);' +
      'transition:opacity .28s ease,transform .38s cubic-bezier(.3,1.3,.4,1);}' +
    '#djVinyl.playing .dj-screen{opacity:1;transform:translate(-50%,-50%) scale(1);}' +
    '#djVinyl .dj-vid{width:100%;height:100%;object-fit:cover;display:block;}' +

    /* hover caption */
    '#djVinyl .dj-cue{position:absolute;top:calc(100% + 10px);left:50%;' +
      'transform:translateX(-50%) translateY(-4px);display:flex;align-items:center;gap:7px;white-space:nowrap;' +
      'background:rgba(12,14,20,0.72);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);' +
      'border:1px solid rgba(255,255,255,0.16);border-radius:999px;padding:5px 12px;' +
      'font:500 0.72rem/1 var(--font-sans,"Helvetica Neue",Helvetica,Arial,sans-serif);color:#fff;' +
      'opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;}' +
    '#djVinyl:hover .dj-cue,#djVinyl:focus-visible .dj-cue{opacity:1;transform:translateX(-50%) translateY(0);}' +
    '#djVinyl .dj-dot{width:7px;height:7px;border-radius:50%;background:#f5b21a;box-shadow:0 0 8px #f5b21a;' +
      'flex:0 0 auto;animation:djPulse 1.6s infinite;}' +
    '@keyframes djPulse{0%,100%{opacity:1}50%{opacity:.35}}' +

    '@media(max-width:640px){#djVinyl{width:104px;height:104px;top:74px;right:12px;}' +
      '#djVinyl.playing{width:140px;height:140px;}}' +
    '@media(prefers-reduced-motion:reduce){#djVinyl .dj-disc,#djVinyl .dj-dot{animation:none;}' +
      '#djVinyl,#djVinyl .dj-screen{transition:none;}}' +
    '@media print{#djVinyl{display:none!important;}}';

  document.head.appendChild(css);
  (function mount() {
    if (!document.body) return setTimeout(mount, 50);
    document.body.appendChild(box);
  })();

  var vid = box.querySelector('.dj-vid');
  var cueText = box.querySelector('.dj-cue-text');
  var loaded = false, saver = 0;
  // Intent, not vid.paused: play() resolves async, so a click landing while it is
  // still settling would otherwise read as "not playing" and restart the clip.
  var wantPlaying = false;

  /* ---------- restore volume + position ---------- */
  var DEFAULT_VOL = 0.8, MIN_AUDIBLE = 0.1;
  /* Restore the volume, but never below an audible floor. The old floating widget
     had a volume slider that wrote this key and could go to 0; that slider is gone,
     so a stale near-zero value would silence the clip forever with no control left
     to turn it back up. */
  vid.volume = DEFAULT_VOL;
  try {
    var sv = parseFloat(localStorage.getItem('djHudVol'));
    if (isFinite(sv) && sv >= MIN_AUDIBLE) vid.volume = Math.min(1, sv);
  } catch (e) {}

  function seekToSaved() {
    try {
      var t = parseFloat(localStorage.getItem('djHudTime') || '0');
      if (t > 0 && vid.duration) vid.currentTime = t % vid.duration;
    } catch (e) {}
  }

  function ensureLoaded() {
    if (loaded) return;
    vid.src = SRC; loaded = true;
    vid.addEventListener('loadedmetadata', seekToSaved, { once: true });
  }

  /* Unmute AND call play() again in the same gesture. Safari/iOS will not start
     audio on a muted-autoplay element from the muted flag alone — it needs the
     play() call inside the user gesture, which is why the old widget re-played
     on unmute too. Without it the record looks unmuted but stays silent. */
  function giveItSound() {
    if (!(vid.volume >= MIN_AUDIBLE)) vid.volume = DEFAULT_VOL;
    vid.muted = false;
    cueText.textContent = 'Stop the record';
    box.setAttribute('aria-label', 'Stop the DJ set');
    // remembered so the next page knows to come back with sound rather than silent
    try { localStorage.setItem('djHudSound', '1'); } catch (e) {}
    var p = vid.play();
    if (p && p.catch) p.catch(function () {
      if (!wantPlaying) return;
      // sound genuinely refused → keep the picture, ask for another tap
      vid.muted = true;
      cueText.textContent = 'Tap for sound';
      box.setAttribute('aria-label', 'Tap the record for sound');
      vid.play().catch(function () { if (wantPlaying) pause(); });
    });
  }

  /* ---------- play / pause ---------- */
  function play() {
    wantPlaying = true;
    try { localStorage.removeItem('djHudStopped'); } catch (e) {}
    ensureLoaded();
    // never talk over the mix player or a music preview
    if (window.MusicHUD) try { window.MusicHUD.pause(); } catch (e) {}
    if (window.__previewAudio) try { window.__previewAudio.pause(); } catch (e) {}
    box.classList.add('playing');
    giveItSound();
  }

  function pause() {
    wantPlaying = false;
    vid.pause();
    box.classList.remove('playing');
    cueText.textContent = 'See what the DJ is doing';
    box.setAttribute('aria-label', 'See what the DJ is doing');
  }

  /* Start playing silently. Browsers only allow autoplay without a gesture when
     muted, so the clip opens silent and the caption asks for the click that
     adds sound. */
  function startMuted() {
    wantPlaying = true;
    ensureLoaded();
    vid.muted = true;
    box.classList.add('playing');
    cueText.textContent = 'Tap for sound';
    box.setAttribute('aria-label', 'Tap the record for sound');
    vid.play().catch(function () { pause(); }); // refused → sit idle and wait for a click
  }

  /* Pick up where the last page left off. A link click is a hard navigation, so
     this element is destroyed and rebuilt — "keeps playing" really means resume
     at the saved timestamp on the next page. If sound was already granted we ask
     for it again; browsers may refuse audio without a fresh gesture, in which
     case we come back silent and one tap restores it. */
  function resume() {
    var withSound = false;
    try { withSound = localStorage.getItem('djHudSound') === '1'; } catch (e) {}
    if (!withSound) { startMuted(); return; }
    wantPlaying = true;
    ensureLoaded();
    box.classList.add('playing');
    giveItSound();
  }

  function toggle() {
    if (!wantPlaying) { play(); return; }
    // running but silent (autostarted, or sound was refused) → this tap gives it sound
    if (vid.muted) { giveItSound(); return; }
    // an explicit stop sticks, so it does not start itself again on the next page
    try {
      localStorage.setItem('djHudStopped', '1');
      localStorage.setItem('djHudPlaying', '0');
      localStorage.removeItem('djHudSound');
    } catch (e) {}
    pause();
  }

  function savePosition() {
    try {
      localStorage.setItem('djHudTime', vid.currentTime);
      localStorage.setItem('djHudVol', vid.volume);
    } catch (e) {}
  }

  vid.addEventListener('play', function () {
    try { localStorage.setItem('djHudPlaying', '1'); } catch (e) {}
    clearInterval(saver);
    saver = setInterval(savePosition, 1000);
  });
  vid.addEventListener('pause', function () { clearInterval(saver); savePosition(); });
  /* pagehide fires on navigation AND on mobile tab-switching, where beforeunload
     is unreliable — without it the resume timestamp is up to a second stale. */
  window.addEventListener('pagehide', savePosition);
  window.addEventListener('beforeunload', savePosition);

  /* ---------- click to toggle, drag to reposition ---------- */
  /* Pointer events only track the drag; the toggle itself runs on `click`.
     Safari/iOS grants the user gesture that unlocks audio from a click, and does
     not reliably grant it from pointerup — so unmuting must hang off click. */
  var down = false, moved = 0, sx = 0, sy = 0, ox = 0, oy = 0;

  box.addEventListener('pointerdown', function (e) {
    down = true; moved = 0; sx = e.clientX; sy = e.clientY;
    var r = box.getBoundingClientRect(); ox = r.left; oy = r.top;
    try { box.setPointerCapture(e.pointerId); } catch (e2) {}
  });

  box.addEventListener('pointermove', function (e) {
    if (!down) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    if (moved <= DRAG_SLOP) return;
    box.classList.add('dragging');
    box.style.right = 'auto';
    box.style.left = Math.max(6, Math.min(window.innerWidth - box.offsetWidth - 6, ox + dx)) + 'px';
    box.style.top = Math.max(6, Math.min(window.innerHeight - box.offsetHeight - 6, oy + dy)) + 'px';
  });

  function endDrag(e) {
    if (!down) return;
    down = false;
    box.classList.remove('dragging');
    if (e && e.pointerId != null) { try { box.releasePointerCapture(e.pointerId); } catch (e2) {} }
  }
  box.addEventListener('pointerup', endDrag);
  box.addEventListener('pointercancel', endDrag);

  box.addEventListener('click', function () { if (moved <= DRAG_SLOP) toggle(); });

  box.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); toggle(); }
  });

  window.DJVinyl = { play: play, pause: pause, toggle: toggle, playing: function () { return wantPlaying; } };

  (function startup() {
    var stopped = false, wasPlaying = false;
    try {
      stopped = localStorage.getItem('djHudStopped') === '1';
      wasPlaying = localStorage.getItem('djHudPlaying') === '1';
    } catch (e) {}
    if (stopped) return;                 // they turned it off; leave it off
    if (wasPlaying) { resume(); return; } // it was running when the last page unloaded
    // first arrival on a page that opts in — the reduced-motion check only guards
    // this unprompted start, never a resume the visitor actually asked for
    if (AUTOSTART && !matchMedia('(prefers-reduced-motion: reduce)').matches) startMuted();
  })();
})();
