/* ============================================================
   PORTFOLIO INTERACTIONS — theme, reveal, scroll-spy, count-up
   ============================================================ */
(function () {
  const root = document.documentElement;

  /* ---------- Theme (shared across pages) ---------- */
  const saved = localStorage.getItem('ns-theme');
  if (saved) root.setAttribute('data-theme', saved);
  function paintTheme() {
    const mode = root.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('[data-theme-knob]').forEach(k => {
      k.classList.toggle('active', k.dataset.themeKnob === mode);
    });
  }
  function toggleTheme() {
    const next = (root.getAttribute('data-theme') === 'light') ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ns-theme', next);
    paintTheme();
  }
  window.__toggleTheme = toggleTheme;

  /* ---------- Bulletproof scroll reveal ---------- */
  let reveals = [];
  function collectReveals() { reveals = [...document.querySelectorAll('.reveal:not(.in)')]; }
  function checkReveal() {
    const h = window.innerHeight || document.documentElement.clientHeight;
    for (const el of reveals) {
      if (el.classList.contains('in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.92 && r.bottom > -40) el.classList.add('in');
    }
    reveals = reveals.filter(el => !el.classList.contains('in'));
  }

  /* ---------- Scroll-spy nav ---------- */
  let sections = [], navlinks = {};
  function buildSpy() {
    sections = [...document.querySelectorAll('section[id]')];
    document.querySelectorAll('[data-spy]').forEach(a => { navlinks[a.dataset.spy] = a; });
  }
  function spy() {
    const y = window.scrollY + window.innerHeight * 0.32;
    let current = sections[0] && sections[0].id;
    for (const s of sections) { if (s.offsetTop <= y) current = s.id; }
    Object.entries(navlinks).forEach(([id, a]) => { const on = id === current; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('.crail a[href^="#"]').forEach(a => { const on = a.getAttribute('href') === '#' + current; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }

  /* ---------- Stat count-up ---------- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dec = (el.dataset.dec ? parseInt(el.dataset.dec) : 0);
    const dur = 1100; const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
    }
    requestAnimationFrame(tick);
  }
  function initCounts() {
    const els = [...document.querySelectorAll('[data-count]')];
    const io = ('IntersectionObserver' in window) ? new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 }) : null;
    els.forEach(el => { if (io) io.observe(el); else countUp(el); });
    // failsafe
    setTimeout(() => els.forEach(el => { if (el.textContent === '' || el.textContent === '0') countUp(el); }), 1400);
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const btn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));
  }

  /* ---------- Smooth anchor scroll ---------- */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        const t = document.getElementById(id);
        if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - 12, behavior: 'smooth' }); }
      });
    });
  }

  /* ---------- Hero parallax glow (subtle) ---------- */
  function initGlow() {
    const glow = document.querySelector('.hero-glow');
    if (!glow) return;
    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      glow.style.transform = `translate(${x}px, ${y}px)`;
    }, { passive: true });
  }

  let _pels = [], _barEl = null;
  function parallax() {
    const vh = window.innerHeight;
    for (const el of _pels) {
      const r = el.getBoundingClientRect();
      const prog = (r.top + r.height / 2 - vh / 2) / vh;
      const sp = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = 'translate3d(0,' + (-prog * sp * 120).toFixed(1) + 'px,0)';
    }
  }
  function progress() {
    if (!_barEl) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    _barEl.style.width = (max > 0 ? (h.scrollTop / max * 100) : 0) + '%';
  }
  function onScroll() { checkReveal(); spy(); parallax(); progress(); }

  function init() {
    paintTheme();
    collectReveals();
    buildSpy();
    initCounts();
    initMobileNav();
    initAnchors();
    initGlow();
    _pels = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? [] : [...document.querySelectorAll('[data-parallax]')];
    _barEl = document.getElementById('scrollProgress');
    parallax(); progress();
    checkReveal(); spy();
    requestAnimationFrame(() => { checkReveal(); spy(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { checkReveal(); spy(); });
    window.addEventListener('load', () => { collectReveals(); checkReveal(); spy(); setTimeout(() => { checkReveal(); spy(); }, 250); });
    // ventures filter
    const vf = document.getElementById('vFilter');
    if (vf) {
      const cards = [...document.querySelectorAll('#work [data-cat]')];
      const vc = document.getElementById('vCount');
      vf.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        [...vf.children].forEach(x => x.classList.toggle('on', x === b));
        const f = b.dataset.f; let n = 0;
        cards.forEach(c => { const show = f === 'all' || c.dataset.cat === f; c.style.display = show ? '' : 'none'; if (show) n++; });
        if (vc) vc.textContent = n;
      });
    }
    // fill year
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
