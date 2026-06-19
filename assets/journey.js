/* ============================================================
   journey.js — guided-journey layer for portfolio.html
   · Fixed-stage scene swaps with per-chapter "camera" moves
   · Companion: the Day Meter — dawn time that advances as you
     scroll (05:42 → 07:05), its dot warming from night to sun
   ============================================================ */
(function () {
  var CH = [
    ['home', 'Before dawn', 'zoom'],
    ['about', 'Who I am', 'tilt'],
    ['why', 'Why dawn', 'zoom'],
    ['tech', 'Theatre & the Arts', 'panl'],
    ['enterprise', 'Enterprise & Engineering', 'panr'],
    ['advocacy', 'Advocacy & Service', 'panl'],
    ['making', 'Mobilizing & Leadership', 'panr'],
    ['writing', 'Words & research', 'tilt'],
    ['receipts', 'The proof', 'rise'],
    ['contact', 'Sunrise', 'zoom']
  ];
  var secs = [];
  CH.forEach(function (c) {
    var s = document.getElementById(c[0]);
    if (s) { s.setAttribute('data-cam', c[2]); secs.push({ el: s, label: c[1] }); }
  });

  /* ---------- Day Meter (companion) ---------- */
  var hud = document.createElement('div');
  hud.className = 'daymeter';
  hud.innerHTML = '<span class="dm-dot"></span><span class="dm-time">05:42</span><span class="dm-sep"></span><span class="dm-ch"></span>';
  document.body.appendChild(hud);
  var dmDot = hud.querySelector('.dm-dot'), dmTime = hud.querySelector('.dm-time'), dmCh = hud.querySelector('.dm-ch');
  var T0 = 5 * 60 + 42, T1 = 7 * 60 + 5; // 05:42 → 07:05

  function lerpColor(p) {
    // indigo night → amber sun
    var a = [122, 138, 255], b = [255, 178, 26];
    var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * p); });
    return 'rgb(' + c.join(',') + ')';
  }

  /* ---------- scene swap ---------- */
  var activeIdx = -1;
  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    secs.forEach(function (s, n) { s.el.classList.toggle('ch-active', n === i); if (n === i) s.el.classList.add('in-view'); });
    dmCh.textContent = secs[i] ? secs[i].label : '';
  }
  function onScroll() {
    var mid = scrollY + innerHeight * 0.5, idx = 0;
    secs.forEach(function (s, n) { if (s.el.offsetTop <= mid) idx = n; });
    setActive(idx);
    var max = document.body.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    var mins = Math.round(T0 + (T1 - T0) * p);
    var hh = Math.floor(mins / 60), mm = mins % 60;
    dmTime.textContent = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
    dmDot.style.background = lerpColor(p);
    dmDot.style.boxShadow = '0 0 ' + (4 + p * 14) + 'px ' + lerpColor(p);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
