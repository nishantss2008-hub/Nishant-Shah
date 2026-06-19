/* ============================================================
   PAGE TRANSITION — pixel/tile dissolve.
   Needs <div class="pt" id="pt"></div> right after <body>.
   ============================================================ */
(function () {
  const pt = document.getElementById('pt');
  if (!pt) return;
  pt.innerHTML = '';

  const size = window.innerWidth < 640 ? 64 : 88;
  const cols = Math.max(4, Math.ceil(window.innerWidth / size));
  const rows = Math.max(4, Math.ceil(window.innerHeight / size));
  const grid = document.createElement('div');
  grid.className = 'pt-grid';
  grid.style.gridTemplateColumns = 'repeat(' + cols + ',1fr)';
  grid.style.gridTemplateRows = 'repeat(' + rows + ',1fr)';
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = document.createElement('div');
      t.className = 'pt-tile';
      // delay radiates from center + a little randomness → organic dissolve
      const dist = Math.hypot(c - cx, r - cy) / Math.hypot(cx, cy);
      t.style.transitionDelay = (dist * 0.28 + Math.random() * 0.12).toFixed(3) + 's';
      grid.appendChild(t);
    }
  }
  pt.appendChild(grid);

  function reveal() { pt.classList.add('pt-open'); setTimeout(function () { pt.style.visibility = 'hidden'; }, 900); }
  function cover(cb) { pt.style.visibility = 'visible'; pt.style.pointerEvents = 'all'; pt.classList.remove('pt-open'); setTimeout(cb, 640); }

  requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  setTimeout(reveal, 160);

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank') return;
    if (href.startsWith('#') || /^(https?:|mailto:|tel:)/.test(href)) return;
    if (!/\.html(\?|#|$)/.test(href)) return;
    e.preventDefault();
    cover(function () { window.location.href = href; });
  });

  window.addEventListener('pageshow', function (e) { if (e.persisted) { pt.style.visibility = 'visible'; reveal(); } });
})();
