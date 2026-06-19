/* ============================================================
   graph2d.js — 2D anchored knowledge graph (Canvas)
   Four fixed spike hubs (T / E / A / M); every item is a node
   linked to the spike(s) it belongs to. Multi-spike items settle
   between their hubs (one-time force settle, then freeze).
   Pan (drag), zoom (wheel/pinch), hover-to-focus, click-to-open.
   No external libraries. Mounts into #graph-stage.
   ============================================================ */
(function () {
  var stage = document.getElementById('graph-stage');
  if (!stage) return;

  var SPIKE = {
    T: { name: 'Theatre & the Arts',        color: '#a78bfa' },
    E: { name: 'Enterprise & Engineering',  color: '#4f86ff' },
    A: { name: 'Advocacy & Service',        color: '#2fb36b' },
    M: { name: 'Mobilizing & Leadership',   color: '#f5b21a' }
  };
  var cs = function (p) { return 'case-study.html?p=' + p; };
  var NODES = [
    { id:'ecovision', label:'Eco-Vision', tag:'MedTech VR', s:['E','A'], href:cs('ecovision') },
    { id:'ventureseek', label:'VentureSeek', tag:'AI for VC', s:['E'], href:cs('ventureseek') },
    { id:'decoy', label:'Decoy', tag:'AI security', s:['E'], href:cs('decoy') },
    { id:'escaperoom', label:'Mobile Escape Room', tag:'Eng + ops', s:['E','M'], href:cs('escaperoom') },
    { id:'deca', label:'Florida DECA', tag:'Exec VP', s:['M','E'], href:cs('deca') },
    { id:'smif', label:'Patriot Portfolio', tag:'Investment fund', s:['E','M'], href:cs('smif') },
    { id:'sbs', label:'Start Business Smart', tag:'Platform', s:['E','M'], href:cs('sbs') },
    { id:'ebit', label:'EBIT Councils', tag:'Consulting', s:['E','A','M'], href:cs('ebit') },
    { id:'nextgen', label:'Next-Gen Learning', tag:'Tutoring', s:['E','A'], href:cs('nextgen') },
    { id:'yis', label:'Young Investors Society', tag:'Analyst', s:['E'], href:cs('yis') },
    { id:'seeusnow', label:'See Us Now', tag:'Advocacy', s:['A','M'], href:cs('seeusnow') },
    { id:'studentcouncil', label:'Student Council', tag:'3× President', s:['M','A'], href:cs('studentcouncil') },
    { id:'internationalism', label:'Internationalism', tag:'Round Square', s:['M','A'], href:cs('internationalism') },
    { id:'beta', label:'Beta Club', tag:'Service', s:['M','A'], href:cs('beta') },
    { id:'stage', label:'On Stage', tag:'22 productions', s:['T'], href:cs('stage') },
    { id:'capture', label:'Capture the Moment', tag:'Photography', s:['T','E'], href:cs('capture') },
    { id:'tedx', label:'TEDx', tag:'Revived', s:['T','M'], href:cs('tedx') },
    { id:'speech', label:'Speech & Debate', tag:'Captain', s:['T','M'], href:cs('speech') },
    { id:'spiceseat', label:'The Spice Seat', tag:'Interview series', s:['T','M'], href:cs('spiceseat') },
    { id:'rewired', label:'Re-Wired for Wealth', tag:'Book', s:['T','E'], href:cs('rewired') },
    { id:'fabric8', label:'Fabric8Labs VC Deck', tag:'Writing', s:['E'], href:'https://drive.google.com/file/d/1xpwSFmCuKguRNOOkt3sl77yTCYEzmHbe/view?usp=sharing' },
    { id:'screenplay', label:'Original Screenplay', tag:'Scholastic Gold', s:['T'], href:'' },
    { id:'johnlocke', label:'John Locke Essay', tag:'High Commendation', s:['T'], href:'https://docs.google.com/document/d/1HMuWBXo9IXhIpI_4RzycAaLibSZ3ciAllisZvjbrA1k/edit?usp=sharing' },
    { id:'rollsroyce', label:'Rolls-Royce Pitch', tag:'Investing', s:['E'], href:'https://www.youtube.com/watch?v=EXf636lzRps' },
    { id:'capitalone', label:'Capital One Brief', tag:'Valuation', s:['E'], href:'https://drive.google.com/file/d/12yF-S2m38KjczRs4qxbl6VR9dmWiQIx2/view?usp=sharing' },
    { id:'fusion', label:'IB EE: Nuclear Fusion', tag:'Physics', s:['E'], href:'' },
    { id:'glopo', label:'IB GloPo IA', tag:'Data centers', s:['E','A'], href:'' },
    { id:'mathia', label:'IB Mathematics IA', tag:'In progress', s:['E'], href:'' },
    { id:'physicsia', label:'IB Physics IA', tag:'In progress', s:['E'], href:'' },
    { id:'atkins', label:'AtkinsRéalis', tag:'Finance intern', s:['E'], href:'' },
    { id:'magnolia', label:'Magnolia Pictures', tag:'Film strategy', s:['T','E'], href:'' },
    { id:'charitybuzz', label:'CharityBuzz', tag:'AI + growth', s:['E'], href:'' },
    { id:'aws', label:'Austrian World Summit', tag:'Climate campaign', s:['A','M'], href:'' },
    { id:'congress', label:'Congressional Office', tag:'Policy', s:['A','M'], href:'' },
    { id:'safehouse', label:'Safe House Project', tag:'Anti-trafficking', s:['A'], href:'' },
    { id:'shadow', label:'Summer Shadowing', tag:'Biochem · law', s:['E'], href:'' },
    { id:'aevum', label:'Aevum Capital', tag:'Investment assoc.', s:['E'], href:'' },
    { id:'ryannece', label:'Ryan Nece Foundation', tag:'Service', s:['A'], href:'' },
    { id:'penguin', label:'Penguin Project', tag:'Theater + service', s:['A','T'], href:'' },
    { id:'hcylc', label:'HCYLC', tag:'Youth leadership', s:['A','M'], href:'' },
    { id:'metro', label:'Metropolitan Ministries', tag:'Service', s:['A'], href:'' },
    { id:'disaster', label:'Disaster Relief', tag:'Service', s:['A'], href:'' },
    { id:'xc', label:'Cross Country', tag:"Boys' Captain", s:['M'], href:'' },
    { id:'soccer', label:'Soccer', tag:'Varsity', s:['M'], href:'' },
    { id:'track', label:'Track & Field', tag:'Varsity', s:['M'], href:'' },
    { id:'ib', label:'IB Diploma · 4.0 UW', tag:'Academics', s:['E'], href:'' },
    { id:'honors', label:'Honor Societies', tag:'Recognition', s:['M'], href:'' }
  ];

  /* photos / logos for nodes that have them */
  var IMG = {
    seeusnow:'assets/photos/sun-nasdaq.jpg',
    stage:'assets/photos/theatre.jpg', capture:'assets/photos/p10.jpg',
    smif:'assets/logos/patriot-eagle.png', yis:'assets/logos/yis-color.svg', beta:'assets/logos/beta.png',
    safehouse:'assets/logos/safehouse.png', deca:'assets/photos/deca-team.jpg', studentcouncil:'assets/photos/deca-arena.jpg',
    internationalism:'assets/photos/sun-capitol.jpg', tedx:'assets/photos/sun-team.jpg'
  };
  var imgCache = {};
  function loadImg(id, cb) {
    if (!IMG[id]) return; if (imgCache[id]) { cb(); return; }
    var im = new Image(); im.onload = function () { imgCache[id] = im; cb(); }; im.onerror = function () { IMG[id] = null; }; im.src = IMG[id];
  }

  var canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.cursor = 'grab';
  stage.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var Wd = 0, Ht = 0;

  /* world coords: hubs at diamond corners of a virtual box (wide for breathing room) */
  var HUB = {
    T: { x: -560, y:  360 },   // bottom-left
    E: { x:  560, y: -360 },   // top-right
    A: { x:  560, y:  360 },   // bottom-right
    M: { x: -560, y: -360 }    // top-left
  };

  var nodes = NODES.map(function (n) {
    var cx = 0, cy = 0;
    n.s.forEach(function (k) { cx += HUB[k].x; cy += HUB[k].y; });
    cx /= n.s.length; cy /= n.s.length;
    return {
      d: n,
      home: { x: cx, y: cy },
      x: cx + (Math.random() - 0.5) * 220,
      y: cy + (Math.random() - 0.5) * 220,
      vx: 0, vy: 0,
      w: 0, h: 0
    };
  });
  // measure node box sizes (room for a thumbnail when present)
  function measure() {
    ctx.font = '600 15px "Helvetica Neue", Arial, sans-serif';
    nodes.forEach(function (nd) {
      var tw = ctx.measureText(nd.d.label).width;
      var thumb = IMG[nd.d.id] ? 50 : (nd.d.s.length * 8 + 6);
      nd.w = Math.max(120, tw + thumb + 26);
      nd.h = 58;
    });
  }

  /* edges */
  var edges = [];
  nodes.forEach(function (nd) { nd.d.s.forEach(function (k) { edges.push({ n: nd, hub: k }); }); });

  /* ---------- force settle (run once, then freeze) ---------- */
  function settle(iter) {
    for (var t = 0; t < iter; t++) {
      for (var a = 0; a < nodes.length; a++) {
        var A2 = nodes[a], fx = 0, fy = 0;
        fx += (A2.home.x - A2.x) * 0.02;
        fy += (A2.home.y - A2.y) * 0.02;
        for (var b = 0; b < nodes.length; b++) {
          if (a === b) continue;
          var dx = A2.x - nodes[b].x, dy = A2.y - nodes[b].y;
          var d2 = dx * dx + dy * dy;
          var minx = (A2.w + nodes[b].w) * 0.55, miny = (A2.h + nodes[b].h) * 1.5;
          var dist = Math.sqrt(d2) || 1;
          if (dist < 320) { var f = (320 - dist) / dist; fx += dx * f * 0.09; fy += dy * f * 0.14; }
        }
        A2.vx = (A2.vx + fx) * 0.8; A2.vy = (A2.vy + fy) * 0.8;
        A2.x += A2.vx; A2.y += A2.vy;
      }
    }
  }
  measure();
  settle(420);

  /* ---------- view transform (pan + zoom) ---------- */
  var view = { x: 0, y: 0, z: 1 };
  function fitView() {
    // fit all content with margin
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    Object.keys(HUB).forEach(function (k) { minX = Math.min(minX, HUB[k].x); maxX = Math.max(maxX, HUB[k].x); minY = Math.min(minY, HUB[k].y); maxY = Math.max(maxY, HUB[k].y); });
    nodes.forEach(function (n) { minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x); minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y); });
    var pad = 120;
    var cw = (maxX - minX) + pad * 2, ch = (maxY - minY) + pad * 2;
    var z = Math.min(Wd / cw, Ht / ch);
    view.z = Math.max(0.6, Math.min(1.4, z));
    view.x = Wd / 2 - ((minX + maxX) / 2) * view.z;
    view.y = Ht / 2 - ((minY + maxY) / 2) * view.z;
  }
  function w2s(x, y) { return { x: x * view.z + view.x, y: y * view.z + view.y }; }
  function s2w(x, y) { return { x: (x - view.x) / view.z, y: (y - view.y) / view.z }; }

  function resize() {
    var r = stage.getBoundingClientRect();
    Wd = r.width; Ht = r.height;
    canvas.width = Wd * DPR; canvas.height = Ht * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------- interaction state ---------- */
  var hovered = null, lockedHub = null;
  var tip = document.getElementById('graph-tip');

  function hubOf(activeNode, hub) {
    if (activeNode) return activeNode.d.s.indexOf(hub) > -1;
    return false;
  }

  function draw() {
    ctx.clearRect(0, 0, Wd, Ht);
    // edges — only when something is focused (calm at rest)
    var focusHub = lockedHub || tmpHub;
    if (hovered || focusHub) {
      ctx.lineWidth = 1.6;
      edges.forEach(function (e) {
        var active = hovered ? (e.n === hovered) : (e.hub === focusHub);
        if (!active) return;
        var p1 = w2s(e.n.x, e.n.y), p2 = w2s(HUB[e.hub].x, HUB[e.hub].y);
        ctx.strokeStyle = hexA(SPIKE[e.hub].color, 0.92);
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      });
    }
    Object.keys(HUB).forEach(function (k) {
      var p = w2s(HUB[k].x, HUB[k].y);
      var dim = (hovered && !hubOf(hovered, k)) || (lockedHub && lockedHub !== k);
      var rad = 15 * view.z + 6;
      // glow
      ctx.beginPath(); ctx.arc(p.x, p.y, rad + 14, 0, 6.2832);
      ctx.fillStyle = hexA(SPIKE[k].color, dim ? 0.05 : 0.16); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, 6.2832);
      ctx.fillStyle = hexA(SPIKE[k].color, dim ? 0.5 : 1); ctx.fill();
      // letter
      ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(15 * view.z + 5) + 'px "Helvetica Neue", Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(k, p.x, p.y + 1);
      // label
      ctx.font = '700 ' + Math.round(13 * Math.max(view.z, 0.8)) + 'px "Helvetica Neue", Arial';
      ctx.fillStyle = hexA(SPIKE[k].color, dim ? 0.4 : 1);
      ctx.textBaseline = 'middle';
      var below = HUB[k].y > 0;
      ctx.fillText(SPIKE[k].name, p.x, p.y + (below ? rad + 18 : -rad - 18));
    });
    // nodes
    nodes.forEach(function (nd) {
      var dim;
      if (hovered) dim = (nd !== hovered);
      else if (lockedHub) dim = (nd.d.s.indexOf(lockedHub) < 0);
      else dim = false;
      var p = w2s(nd.x, nd.y);
      var isH = nd === hovered;
      var scl = isH ? 1.32 : 1;
      var w = nd.w * view.z * scl, h = nd.h * view.z * scl;
      var prim = SPIKE[nd.d.s[0]].color;
      ctx.globalAlpha = dim ? 0.22 : 1;
      // body
      roundRect(ctx, p.x - w / 2, p.y - h / 2, w, h, 9 * view.z);
      ctx.fillStyle = isH ? '#15161d' : 'rgba(18,19,26,0.96)';
      ctx.fill();
      ctx.lineWidth = isH ? 2 : 1.2;
      ctx.strokeStyle = hexA(prim, isH ? 1 : 0.5);
      ctx.stroke();
      var leftX = p.x - w / 2;
      var contentX;
      var img = imgCache[nd.d.id];
      if (img) {
        // rounded thumbnail on the left
        var ts = h - 8 * view.z, tx = leftX + 5 * view.z, ty = p.y - ts / 2;
        ctx.save();
        roundRect(ctx, tx, ty, ts, ts, 7 * view.z); ctx.clip();
        ctx.fillStyle = '#0c0d12'; ctx.fillRect(tx, ty, ts, ts);
        var ir = img.width / img.height, dw, dh, ox, oy;
        if (ir > 1) { dh = ts; dw = ts * ir; ox = (ts - dw) / 2; oy = 0; } else { dw = ts; dh = ts / ir; ox = 0; oy = (ts - dh) / 2; }
        ctx.drawImage(img, tx + ox, ty + oy, dw, dh);
        ctx.restore();
        contentX = tx + ts + 9 * view.z;
      } else {
        // multi-spike dots on the left
        var dotx = leftX + 11 * view.z;
        nd.d.s.forEach(function (k, i) {
          ctx.beginPath(); ctx.arc(dotx + i * 9 * view.z, p.y, 3.4 * view.z, 0, 6.2832);
          ctx.fillStyle = SPIKE[k].color; ctx.fill();
        });
        contentX = dotx + nd.d.s.length * 9 * view.z + 4 * view.z;
      }
      // label
      ctx.fillStyle = dim ? 'rgba(255,255,255,0.6)' : '#fff';
      ctx.font = '600 ' + Math.round(14 * view.z * scl) + 'px "Helvetica Neue", Arial';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(nd.d.label, contentX, p.y);
      ctx.globalAlpha = 1;
    });
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  /* ---------- hit testing ---------- */
  function nodeAt(sx, sy) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      var nd = nodes[i], p = w2s(nd.x, nd.y);
      var w = nd.w * view.z, h = nd.h * view.z;
      if (sx >= p.x - w / 2 && sx <= p.x + w / 2 && sy >= p.y - h / 2 && sy <= p.y + h / 2) return nd;
    }
    return null;
  }
  function hubAt(sx, sy) {
    var found = null;
    Object.keys(HUB).forEach(function (k) {
      var p = w2s(HUB[k].x, HUB[k].y), rad = 15 * view.z + 8;
      if ((sx - p.x) * (sx - p.x) + (sy - p.y) * (sy - p.y) <= rad * rad) found = k;
    });
    return found;
  }

  /* ---------- pointer ---------- */
  var down = false, moved = false, lx = 0, ly = 0;
  canvas.addEventListener('pointerdown', function (e) { down = true; moved = false; lx = e.clientX; ly = e.clientY; canvas.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', function () { down = false; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    if (down) {
      var dx = e.clientX - lx, dy = e.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      view.x += dx; view.y += dy; lx = e.clientX; ly = e.clientY;
      if (tip) tip.style.display = 'none';
      draw(); return;
    }
    var nd = nodeAt(sx, sy);
    if (nd !== hovered) { hovered = nd; draw(); }
    if (nd) {
      canvas.style.cursor = nd.d.href ? 'pointer' : 'default';
      if (tip) {
        tip.innerHTML = '<div class="gt-name">' + nd.d.label + '</div>'
          + '<div class="gt-row">' + nd.d.s.map(function (k) { return '<span class="gt-chip s' + k + '">' + k + '</span>'; }).join('') + '<span class="gt-g">' + nd.d.tag + '</span></div>'
          + (nd.d.href ? '<div class="gt-view">' + (nd.d.href.indexOf('http') === 0 ? 'Open ↗' : 'View case study →') + '</div>' : '');
        tip.style.display = 'block'; tip.style.left = (e.clientX + 16) + 'px'; tip.style.top = (e.clientY + 14) + 'px';
      }
    } else {
      var hb = hubAt(sx, sy);
      canvas.style.cursor = hb ? 'pointer' : 'grab';
      if (tip) tip.style.display = 'none';
    }
  });
  canvas.addEventListener('pointerleave', function () { hovered = null; if (tip) tip.style.display = 'none'; draw(); });
  canvas.addEventListener('click', function (e) {
    if (moved) return;
    var r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    var nd = nodeAt(sx, sy);
    if (nd) { if (!nd.d.href) return; if (nd.d.href.indexOf('http') === 0) window.open(nd.d.href, '_blank', 'noopener'); else window.location.href = nd.d.href; return; }
    var hb = hubAt(sx, sy);
    if (hb) { lockedHub = (lockedHub === hb) ? null : hb; syncLegend(); draw(); return; }
    lockedHub = null; syncLegend(); draw();
  });
  // zoom
  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = canvas.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
    var before = s2w(sx, sy);
    view.z = Math.max(0.22, Math.min(2.4, view.z * (e.deltaY < 0 ? 1.12 : 0.89)));
    var after = w2s(before.x, before.y);
    view.x += sx - after.x; view.y += sy - after.y;
    draw();
  }, { passive: false });
  // pinch
  var pd = 0;
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length === 2) {
      var dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY, d = Math.hypot(dx, dy);
      if (pd) { view.z = Math.max(0.22, Math.min(2.4, view.z * (d / pd))); draw(); }
      pd = d; e.preventDefault();
    }
  }, { passive: false });
  canvas.addEventListener('touchend', function () { pd = 0; });

  /* ---------- legend ---------- */
  var legend = document.getElementById('graph-legend');
  function syncLegend() {
    if (!legend) return;
    legend.querySelectorAll('.gl-chip').forEach(function (x) { x.classList.toggle('on', x.dataset.hub === lockedHub); });
  }
  if (legend) {
    legend.innerHTML = Object.keys(SPIKE).map(function (k) { return '<button class="gl-chip" data-hub="' + k + '"><span class="gl-dot s' + k + '"></span>' + k + ' · ' + SPIKE[k].name + '</button>'; }).join('');
    legend.querySelectorAll('.gl-chip').forEach(function (b) {
      b.addEventListener('mouseenter', function () { if (!lockedHub) { lockedHub = b.dataset.hub; draw(); lockedHub = null; setTimeout(draw, 0); } });
    });
    // simpler: hover preview via temp
    legend.querySelectorAll('.gl-chip').forEach(function (b) {
      b.onmouseenter = function () { tmpHub = b.dataset.hub; draw2(); };
      b.onmouseleave = function () { tmpHub = null; draw2(); };
      b.onclick = function () { lockedHub = (lockedHub === b.dataset.hub) ? null : b.dataset.hub; tmpHub = null; syncLegend(); draw(); };
    });
  }
  var tmpHub = null;
  function draw2() { var save = lockedHub; if (tmpHub) lockedHub = tmpHub; draw(); lockedHub = save; }

  /* ---------- boot ---------- */
  var started = false;
  function boot() { if (started) return; started = true; resize(); fitView(); draw(); Object.keys(IMG).forEach(function (id) { loadImg(id, function () { measure(); draw(); }); }); }
  window.addEventListener('resize', function () { resize(); fitView(); draw(); });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) boot(); }); }, { threshold: 0.02 });
  io.observe(stage);
  setTimeout(boot, 800);
})();
