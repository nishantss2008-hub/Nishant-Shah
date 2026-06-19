/* ============================================================
   graph3d.js — 3D force-directed knowledge graph
   Four spike hubs (T / E / A / M); every portfolio item is a
   floating CARD pulled toward the spike(s) it belongs to.
   Hover to highlight a thread, click to open. THREE r128.
   Mounts into #graph-stage; tooltip #graph-tip; legend #graph-legend.
   ============================================================ */
(function () {
  if (typeof THREE === 'undefined') return;
  var stage = document.getElementById('graph-stage');
  if (!stage) return;

  var SPIKE = {
    T: { name: 'Theatre & the Arts',       color: 0xa78bfa },
    E: { name: 'Enterprise & Engineering', color: 0x4f86ff },
    A: { name: 'Advocacy & Service',       color: 0x2fb36b },
    M: { name: 'Mobilizing & Leadership',  color: 0xf5b21a }
  };
  var cs = function (p) { return 'case-study.html?p=' + p; };
  var NODES = [
    { id:'ecovision', label:'Eco-Vision', tag:'MedTech VR', s:['E','A'], href:cs('ecovision'), g:'project' },
    { id:'ventureseek', label:'VentureSeek', tag:'AI for VC', s:['E'], href:cs('ventureseek'), g:'project' },
    { id:'decoy', label:'Decoy', tag:'AI security', s:['E'], href:cs('decoy'), g:'project' },
    { id:'escaperoom', label:'Mobile Escape Room', tag:'Eng + ops', s:['E','M'], href:cs('escaperoom'), g:'project' },
    { id:'deca', label:'Florida DECA', tag:'Exec VP', s:['M','E'], href:cs('deca'), g:'project' },
    { id:'smif', label:'Patriot Portfolio', tag:'Fund', s:['E','M'], href:cs('smif'), g:'project' },
    { id:'sbs', label:'Start Business Smart', tag:'Platform', s:['E','M'], href:cs('sbs'), g:'project' },
    { id:'ebit', label:'EBIT Councils', tag:'Consulting', s:['E','A','M'], href:cs('ebit'), g:'project' },
    { id:'nextgen', label:'Next-Gen Learning', tag:'Tutoring', s:['E','A'], href:cs('nextgen'), g:'project' },
    { id:'yis', label:'Young Investors Society', tag:'Analyst', s:['E'], href:cs('yis'), g:'project' },
    { id:'seeusnow', label:'See Us Now', tag:'Advocacy', s:['A','M'], href:cs('seeusnow'), g:'project' },
    { id:'studentcouncil', label:'Student Council', tag:'3× President', s:['M','A'], href:cs('studentcouncil'), g:'project' },
    { id:'internationalism', label:'Internationalism', tag:'Round Square', s:['M','A'], href:cs('internationalism'), g:'project' },
    { id:'beta', label:'Beta Club', tag:'Service', s:['M','A'], href:cs('beta'), g:'project' },
    { id:'stage', label:'On Stage', tag:'22 productions', s:['T'], href:cs('stage'), g:'project' },
    { id:'capture', label:'Capture the Moment', tag:'Photography', s:['T','E'], href:cs('capture'), g:'project' },
    { id:'tedx', label:'TEDx', tag:'Revived', s:['T','M'], href:cs('tedx'), g:'project' },
    { id:'speech', label:'Speech & Debate', tag:'Captain', s:['T','M'], href:cs('speech'), g:'project' },
    { id:'spiceseat', label:'The Spice Seat', tag:'Interview series', s:['T','M'], href:cs('spiceseat'), g:'project' },
    { id:'rewired', label:'Re-Wired for Wealth', tag:'Book', s:['T','E'], href:cs('rewired'), g:'project' },
    { id:'fabric8', label:'Fabric8Labs VC Deck', tag:'Writing', s:['E'], href:'https://drive.google.com/file/d/1xpwSFmCuKguRNOOkt3sl77yTCYEzmHbe/view?usp=sharing', g:'writing' },
    { id:'screenplay', label:'Original Screenplay', tag:'Scholastic Gold', s:['T'], href:'', g:'writing' },
    { id:'johnlocke', label:'John Locke Essay', tag:'High Commendation', s:['T'], href:'https://docs.google.com/document/d/1HMuWBXo9IXhIpI_4RzycAaLibSZ3ciAllisZvjbrA1k/edit?usp=sharing', g:'writing' },
    { id:'rollsroyce', label:'Rolls-Royce Pitch', tag:'Investing', s:['E'], href:'https://www.youtube.com/watch?v=EXf636lzRps', g:'writing' },
    { id:'capitalone', label:'Capital One Brief', tag:'Valuation', s:['E'], href:'https://drive.google.com/file/d/12yF-S2m38KjczRs4qxbl6VR9dmWiQIx2/view?usp=sharing', g:'writing' },
    { id:'fusion', label:'IB EE: Nuclear Fusion', tag:'Physics', s:['E'], href:'', g:'writing' },
    { id:'glopo', label:'IB GloPo IA', tag:'Data centers', s:['E','A'], href:'', g:'writing' },
    { id:'mathia', label:'IB Mathematics IA', tag:'In progress', s:['E'], href:'', g:'writing' },
    { id:'physicsia', label:'IB Physics IA', tag:'In progress', s:['E'], href:'', g:'writing' },
    { id:'atkins', label:'AtkinsRéalis', tag:'Finance intern', s:['E'], href:'', g:'experience' },
    { id:'magnolia', label:'Magnolia Pictures', tag:'Film strategy', s:['T','E'], href:'', g:'experience' },
    { id:'charitybuzz', label:'CharityBuzz', tag:'AI + growth', s:['E'], href:'', g:'experience' },
    { id:'aws', label:'Austrian World Summit', tag:'Climate campaign', s:['A','M'], href:'', g:'experience' },
    { id:'congress', label:'Congressional Office', tag:'Policy', s:['A','M'], href:'', g:'experience' },
    { id:'safehouse', label:'Safe House Project', tag:'Anti-trafficking', s:['A'], href:'', g:'experience' },
    { id:'shadow', label:'Summer Shadowing', tag:'Biochem · law', s:['E'], href:'', g:'experience' },
    { id:'aevum', label:'Aevum Capital', tag:'Investment assoc.', s:['E'], href:'', g:'experience' },
    { id:'ryannece', label:'Ryan Nece Foundation', tag:'Service', s:['A'], href:'', g:'service' },
    { id:'penguin', label:'Penguin Project', tag:'Theater + service', s:['A','T'], href:'', g:'service' },
    { id:'hcylc', label:'HCYLC', tag:'Youth leadership', s:['A','M'], href:'', g:'service' },
    { id:'metro', label:'Metropolitan Ministries', tag:'Service', s:['A'], href:'', g:'service' },
    { id:'disaster', label:'Disaster Relief', tag:'Service', s:['A'], href:'', g:'service' },
    { id:'xc', label:'Cross Country', tag:"Boys' Captain", s:['M'], href:'', g:'athletics' },
    { id:'soccer', label:'Soccer', tag:'Varsity', s:['M'], href:'', g:'athletics' },
    { id:'track', label:'Track & Field', tag:'Varsity', s:['M'], href:'', g:'athletics' },
    { id:'ib', label:'IB Diploma · 4.0 UW', tag:'Academics', s:['E'], href:'', g:'academic' },
    { id:'honors', label:'Honor Societies', tag:'Recognition', s:['M'], href:'', g:'academic' }
  ];

  var W = function () { return stage.clientWidth; };
  var H = function () { return stage.clientHeight; };
  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05060a, 0.00018);
  var camera = new THREE.PerspectiveCamera(56, W() / H(), 1, 6000);
  camera.position.set(0, 20, 760);
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  stage.appendChild(renderer.domElement);
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.cursor = 'grab';

  var root = new THREE.Group();
  scene.add(root);

  var R = 250;
  var HUBPOS = {
    E: new THREE.Vector3( 1,  1,  1).multiplyScalar(R / Math.sqrt(3)),
    A: new THREE.Vector3( 1, -1, -1).multiplyScalar(R / Math.sqrt(3)),
    M: new THREE.Vector3(-1,  1, -1).multiplyScalar(R / Math.sqrt(3)),
    T: new THREE.Vector3(-1, -1,  1).multiplyScalar(R / Math.sqrt(3))
  };
  function hex(n) { return '#' + ('000000' + n.toString(16)).slice(-6); }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- image map (local assets; rest get a styled placeholder) ---------- */
  var IMG = {
    deca:'assets/photos/deca-team.jpg', seeusnow:'assets/photos/sun-nasdaq.jpg',
    stage:'assets/photos/theatre.jpg', capture:'assets/photos/p10.jpg',
    smif:'assets/logos/patriot-eagle.png', yis:'assets/logos/yis-color.svg',
    beta:'assets/logos/beta.png', safehouse:'assets/logos/safehouse.png'
  };
  var DPR = 2, CW = 360, CH = 224;
  function fitText(ctx, txt, max) { var t = txt; while (ctx.measureText(t).width > max && t.length > 4) t = t.slice(0, -2); return t === txt ? txt : t.replace(/.$/,'…'); }
  function drawChrome(ctx, n) {
    // bottom gradient for legibility
    var g = ctx.createLinearGradient(0, CH*0.4, 0, CH);
    g.addColorStop(0,'rgba(8,9,13,0)'); g.addColorStop(0.62,'rgba(8,9,13,0.74)'); g.addColorStop(1,'rgba(6,7,10,0.97)');
    ctx.fillStyle = g; ctx.fillRect(0,0,CW,CH);
    // title + tag
    ctx.textBaseline='alphabetic'; ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=10;
    ctx.fillStyle='#fff'; ctx.font='700 31px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(fitText(ctx, n.label, CW-44), 20, CH-46);
    ctx.shadowBlur=6; ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='500 20px "Helvetica Neue", Arial, sans-serif';
    ctx.fillText(fitText(ctx, n.tag||'', CW-44), 20, CH-20);
    ctx.shadowBlur=0;
  }
  function clipRound(ctx){ roundRect(ctx,0,0,CW,CH,16); ctx.clip(); }
  function makeCard(n) {
    var prim = SPIKE[n.s[0]].color;
    var cv = document.createElement('canvas'); cv.width = CW*DPR; cv.height = CH*DPR;
    var ctx = cv.getContext('2d'); ctx.scale(DPR,DPR);
    function placeholder(){
      ctx.save(); clipRound(ctx);
      var gr=ctx.createLinearGradient(0,0,CW,CH);
      gr.addColorStop(0,'rgba(38,40,48,0.95)'); gr.addColorStop(1,'rgba(10,11,15,0.99)');
      ctx.fillStyle='#0c0d12'; ctx.fillRect(0,0,CW,CH); ctx.fillStyle=gr; ctx.fillRect(0,0,CW,CH);
      // big ghost initial
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.font='800 150px "Helvetica Neue", Arial'; ctx.textBaseline='middle'; ctx.textAlign='right'; ctx.fillText(n.label[0], CW-10, CH*0.42); ctx.textAlign='left';
      drawChrome(ctx,n); ctx.restore();
      ctx.lineWidth=1.5; ctx.strokeStyle='rgba(255,255,255,0.16)'; roundRect(ctx,1,1,CW-2,CH-2,16); ctx.stroke();
    }
    placeholder();
    var tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
    var src = IMG[n.id];
    if (src) {
      var im = new Image();
      im.onload = function(){
        ctx.clearRect(0,0,CW,CH); ctx.save(); clipRound(ctx);
        var ir=im.width/im.height, cr=CW/CH, dw,dh,ox,oy;
        if(ir>cr){ dh=CH; dw=CH*ir; ox=(CW-dw)/2; oy=0; } else { dw=CW; dh=CW/ir; ox=0; oy=(CH-dh)/2; }
        ctx.fillStyle='#0c0d12'; ctx.fillRect(0,0,CW,CH); ctx.drawImage(im,ox,oy,dw,dh);
        drawChrome(ctx,n); ctx.restore();
        ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,0.14)'; roundRect(ctx,1,1,CW-2,CH-2,16); ctx.stroke();
        tex.needsUpdate = true;
      };
      im.onerror = function(){};
      im.src = src;
    }
    var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true }));
    var K = 2.3;
    spr.scale.set(CW / K, CH / K, 1);
    spr.userData.baseScale = new THREE.Vector2(CW / K, CH / K);
    return spr;
  }

  /* ---------- hubs ---------- */
  Object.keys(SPIKE).forEach(function (k) {
    var c = SPIKE[k].color;
    var m = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 32), new THREE.MeshBasicMaterial({ color: c }));
    m.position.copy(HUBPOS[k]); m.userData = { hub: k }; root.add(m);
    var glow = new THREE.Mesh(new THREE.SphereGeometry(27, 24, 24), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.14 }));
    glow.position.copy(HUBPOS[k]); root.add(glow);
    // hub label card
    var cv = document.createElement('canvas'); var ctx = cv.getContext('2d');
    var txt = k + ' · ' + SPIKE[k].name; ctx.font = '700 38px "Helvetica Neue", Arial';
    var w = ctx.measureText(txt).width; cv.width = (w + 44) * DPR; cv.height = 72 * DPR;
    ctx = cv.getContext('2d'); ctx.scale(DPR, DPR); ctx.font = '700 38px "Helvetica Neue", Arial'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(8,8,12,0.78)'; roundRect(ctx, 0, 0, w + 44, 72, 16); ctx.fill();
    ctx.fillStyle = hex(c); ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8; ctx.fillText(txt, 22, 38);
    var tex = new THREE.CanvasTexture(cv); tex.minFilter = THREE.LinearFilter;
    var lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    lbl.scale.set((w + 44) / 5.2, 72 / 5.2, 1);
    lbl.position.copy(HUBPOS[k]).multiplyScalar(1.2);
    root.add(lbl);
  });

  /* ---------- item cards ---------- */
  var items = [];
  NODES.forEach(function (n) {
    var center = new THREE.Vector3();
    n.s.forEach(function (k) { center.add(HUBPOS[k]); });
    center.multiplyScalar(1 / n.s.length);
    var spr = makeCard(n);
    spr.position.copy(center.clone().add(new THREE.Vector3((Math.random()-.5)*140,(Math.random()-.5)*140,(Math.random()-.5)*140)));
    spr.userData.node = n;
    root.add(spr);
    items.push({ node: n, mesh: spr, vel: new THREE.Vector3(), home: center });
  });

  /* ---------- edges ---------- */
  var edgeList = [];
  items.forEach(function (it, ii) { it.node.s.forEach(function (k) { edgeList.push({ item: ii, hub: k, color: SPIKE[k].color }); }); });
  var EN = edgeList.length;
  var ePos = new Float32Array(EN * 6), eCol = new Float32Array(EN * 6);
  var egeo = new THREE.BufferGeometry();
  egeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  egeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  var elines = new THREE.LineSegments(egeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.82 }));
  elines.renderOrder = -1;
  root.add(elines);
  var tmpC = new THREE.Color();
  function edgeColor(i, mul) {
    tmpC.setHex(edgeList[i].color).multiplyScalar(mul);
    for (var o = 0; o < 6; o += 3) { eCol[i*6+o]=tmpC.r; eCol[i*6+o+1]=tmpC.g; eCol[i*6+o+2]=tmpC.b; }
  }
  for (var i = 0; i < EN; i++) edgeColor(i, 0.62);
  egeo.attributes.color.needsUpdate = true;

  /* ---------- force layout ---------- */
  function step() {
    for (var a = 0; a < items.length; a++) {
      var A2 = items[a], f = new THREE.Vector3();
      f.add(A2.home.clone().sub(A2.mesh.position).multiplyScalar(0.011));
      for (var b = 0; b < items.length; b++) {
        if (a === b) continue;
        var d = A2.mesh.position.clone().sub(items[b].mesh.position);
        var dist = Math.max(d.length(), 10);
        f.add(d.multiplyScalar(720 / (dist * dist)));
      }
      A2.vel.add(f).multiplyScalar(0.82);
      A2.mesh.position.add(A2.vel.clone().multiplyScalar(0.18));
    }
    for (var e = 0; e < EN; e++) {
      var ed = edgeList[e], ip = items[ed.item].mesh.position, hp = HUBPOS[ed.hub];
      ePos[e*6]=ip.x; ePos[e*6+1]=ip.y; ePos[e*6+2]=ip.z;
      ePos[e*6+3]=hp.x; ePos[e*6+4]=hp.y; ePos[e*6+5]=hp.z;
    }
    egeo.attributes.position.needsUpdate = true;
  }
  for (var s0 = 0; s0 < 260; s0++) step();

  /* ---------- interaction ---------- */
  var ray = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var tip = document.getElementById('graph-tip');
  var hovered = null, locked = null;
  var GROUP_LABEL = { project:'Project', writing:'Writing & research', experience:'Experience', service:'Service', athletics:'Athletics', academic:'Academics' };

  function applyItem(setOn) {
    items.forEach(function (o) {
      var on = setOn(o);
      o.mesh.material.opacity = on ? 1 : 0.12;
      var isH = (hovered && o === hovered), bs = o.mesh.userData.baseScale, k = isH ? 2.9 : 1;
      o.mesh.scale.set(bs.x * k, bs.y * k, 1);
      o.mesh.renderOrder = isH ? 50 : 0;
      o.mesh.material.depthTest = !isH;
    });
  }
  function highlightItem(it) {
    applyItem(function (o) { return !it || o === it; });
    var edgesOf = {}; for (var e = 0; e < EN; e++) if (items[edgeList[e].item] === it) edgesOf[e] = true;
    for (var e2 = 0; e2 < EN; e2++) edgeColor(e2, it ? (edgesOf[e2] ? 1.35 : 0.12) : 0.62);
    egeo.attributes.color.needsUpdate = true;
  }
  function highlightHub(hub) {
    var act = {}; for (var e = 0; e < EN; e++) if (edgeList[e].hub === hub) act[edgeList[e].item] = true;
    items.forEach(function (o, idx) { var on = act[idx]; o.mesh.material.opacity = on ? 1 : 0.1; });
    for (var e2 = 0; e2 < EN; e2++) edgeColor(e2, edgeList[e2].hub === hub ? 1.3 : 0.1);
    egeo.attributes.color.needsUpdate = true;
  }
  function clearHi() {
    items.forEach(function (o) { o.mesh.material.opacity = 1; o.mesh.material.depthTest = true; var bs = o.mesh.userData.baseScale; o.mesh.scale.set(bs.x, bs.y, 1); o.mesh.renderOrder = 0; });
    for (var e = 0; e < EN; e++) edgeColor(e, 0.62);
    egeo.attributes.color.needsUpdate = true;
  }

  function pick(ev) {
    var r = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    mouse.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    var objs = items.map(function (i) { return i.mesh; });
    Object.keys(SPIKE).forEach(function () {});
    root.children.forEach(function (c) { if (c.userData && c.userData.hub) objs.push(c); });
    var hit = ray.intersectObjects(objs, false)[0];
    return hit ? hit.object : null;
  }

  var down = false, moved = false, lx = 0, ly = 0;
  renderer.domElement.addEventListener('pointerdown', function (ev) { down = true; moved = false; lx = ev.clientX; ly = ev.clientY; renderer.domElement.style.cursor = 'grabbing'; });
  window.addEventListener('pointerup', function () { down = false; renderer.domElement.style.cursor = 'grab'; });
  renderer.domElement.addEventListener('pointermove', function (ev) {
    if (down) {
      var dx = ev.clientX - lx, dy = ev.clientY - ly;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      root.rotation.y += dx * 0.006;
      root.rotation.x = Math.max(-1.1, Math.min(1.1, root.rotation.x + dy * 0.006));
      lx = ev.clientX; ly = ev.clientY;
      if (tip) tip.style.display = 'none';
      return;
    }
    var obj = pick(ev);
    if (obj && obj.userData.node) {
      var it = items.find(function (i) { return i.mesh === obj; });
      if (it !== hovered) { hovered = it; if (!locked) highlightItem(it); }
      renderer.domElement.style.cursor = it.node.href ? 'pointer' : 'default';
      if (tip) {
        var n = it.node;
        tip.innerHTML = '<div class="gt-name">' + n.label + '</div>'
          + '<div class="gt-row">' + n.s.map(function (k) { return '<span class="gt-chip s' + k + '">' + k + '</span>'; }).join('') + '<span class="gt-g">' + (GROUP_LABEL[n.g] || '') + '</span></div>'
          + (n.href ? '<div class="gt-view">' + (n.href.indexOf('http') === 0 ? 'Open ↗' : 'View case study →') + '</div>' : '');
        tip.style.display = 'block'; tip.style.left = (ev.clientX + 16) + 'px'; tip.style.top = (ev.clientY + 14) + 'px';
      }
    } else if (obj && obj.userData.hub) {
      hovered = null; if (!locked) highlightHub(obj.userData.hub);
      renderer.domElement.style.cursor = 'pointer';
      if (tip) { tip.innerHTML = '<div class="gt-name">' + SPIKE[obj.userData.hub].name + '</div><div class="gt-row"><span class="gt-chip s' + obj.userData.hub + '">' + obj.userData.hub + '</span></div>'; tip.style.display = 'block'; tip.style.left = (ev.clientX + 16) + 'px'; tip.style.top = (ev.clientY + 14) + 'px'; }
    } else {
      if (hovered) { hovered = null; if (!locked) clearHi(); }
      renderer.domElement.style.cursor = 'grab';
      if (tip) tip.style.display = 'none';
    }
  });
  renderer.domElement.addEventListener('pointerleave', function () { if (tip) tip.style.display = 'none'; if (!locked) { clearHi(); hovered = null; } });
  renderer.domElement.addEventListener('click', function (ev) {
    if (moved) return;
    var obj = pick(ev);
    if (!obj) { locked = null; clearHi(); return; }
    if (obj.userData.hub) { locked = locked === obj.userData.hub ? null : obj.userData.hub; if (locked) highlightHub(locked); else clearHi(); return; }
    if (obj.userData.node) {
      var n = obj.userData.node; if (!n.href) return;
      if (n.href.indexOf('http') === 0) window.open(n.href, '_blank', 'noopener'); else window.location.href = n.href;
    }
  });

  var legend = document.getElementById('graph-legend');
  if (legend) {
    legend.innerHTML = Object.keys(SPIKE).map(function (k) { return '<button class="gl-chip" data-hub="' + k + '"><span class="gl-dot s' + k + '"></span>' + k + ' · ' + SPIKE[k].name + '</button>'; }).join('');
    legend.querySelectorAll('.gl-chip').forEach(function (b) {
      b.addEventListener('mouseenter', function () { if (!locked) highlightHub(b.dataset.hub); });
      b.addEventListener('mouseleave', function () { if (!locked) clearHi(); });
      b.addEventListener('click', function () { locked = locked === b.dataset.hub ? null : b.dataset.hub; legend.querySelectorAll('.gl-chip').forEach(function (x) { x.classList.toggle('on', x === b && locked); }); if (locked) highlightHub(locked); else clearHi(); });
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); }
  window.addEventListener('resize', resize);

  /* ---------- zoom (wheel + pinch) ---------- */
  var zoom = 760, ZMIN = 200, ZMAX = 1750;
  function applyZoom(z){ zoom = Math.max(ZMIN, Math.min(ZMAX, z)); camera.position.z = zoom; }
  renderer.domElement.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    applyZoom(zoom + ev.deltaY * 0.6);
  }, { passive: false });
  var pinch = 0;
  renderer.domElement.addEventListener('touchmove', function (ev) {
    if (ev.touches.length === 2) {
      var dx = ev.touches[0].clientX - ev.touches[1].clientX, dy = ev.touches[0].clientY - ev.touches[1].clientY;
      var d = Math.hypot(dx, dy);
      if (pinch) applyZoom(zoom - (d - pinch) * 1.4);
      pinch = d; ev.preventDefault();
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchend', function () { pinch = 0; });

  var started = false, frames = 0;
  function loop() {
    requestAnimationFrame(loop);
    // settle the layout early, then freeze so cards are easy to read
    if (frames < 220) { step(); frames++; }
    else if (down) { step(); } // re-settle only while the user is dragging
    if (!down && !hovered && !locked && !reduce) root.rotation.y += 0.0006;
    renderer.render(scene, camera);
  }
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !started) { started = true; resize(); loop(); } }); }, { threshold: 0.02 });
  io.observe(stage);
  setTimeout(function () { if (!started) { started = true; resize(); loop(); } }, 1200);
})();
