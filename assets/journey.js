/* ============================================================
   journey.js — guided-journey layer for portfolio.html
   · Fixed-stage scene swaps with per-chapter "camera" moves
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

  /* ---------- scene swap ---------- */
  var activeIdx = -1;
  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    secs.forEach(function (s, n) { s.el.classList.toggle('ch-active', n === i); if (n === i) s.el.classList.add('in-view'); });
  }
  function onScroll() {
    var mid = scrollY + innerHeight * 0.5, idx = 0;
    secs.forEach(function (s, n) { if (s.el.offsetTop <= mid) idx = n; });
    setActive(idx);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
