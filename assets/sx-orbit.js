/* ============================================================
   sx-orbit.js — the whole story in one looping scene.
   Act 1  "how it was":   Falcon 9 climbs, strings out a train
                          of ~24 satellites.
   Act 2  "the handover": Starship climbs, fans out 64 at once.
   Act 3  "how it will be": thousands of satellites in shells,
                          lasing to each other and beaming home.
   Real assets: NASA Blue Marble earth texture (public domain),
   Falcon 9 via Wikimedia Commons (CC BY-SA 4.0), Starship built
   to public dimensions. THREE r128. Mounts on #orbitAnim.
   ============================================================ */
(function () {
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;
  var host = document.getElementById('orbitAnim');
  if (!host) return;
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var capEl = document.getElementById('orbitCap');

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch (e) { host.classList.add('m3d-fail'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(42, 1.6, 0.05, 60);

  scene.add(new THREE.AmbientLight(0x33404f, 0.9));
  var sun = new THREE.DirectionalLight(0xffffff, 1.25);
  sun.position.set(6, 2.5, 4);
  scene.add(sun);

  /* ---------- earth ---------- */
  var earth = new THREE.Group();
  scene.add(earth);
  var tex = new THREE.TextureLoader().load('assets/textures/earth_2048.jpg');
  tex.encoding = THREE.sRGBEncoding;
  var globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 56, 40),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 })
  );
  earth.add(globe);
  var atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.035, 40, 28),
    new THREE.MeshBasicMaterial({ color: 0x5aa2ff, transparent: true, opacity: 0.07, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(atmo);

  /* ---------- helpers ---------- */
  function planeQuat(incDeg, raanDeg) {
    var q = new THREE.Quaternion();
    var e = new THREE.Euler(THREE.MathUtils.degToRad(incDeg), THREE.MathUtils.degToRad(raanDeg), 0, 'YXZ');
    q.setFromEuler(e);
    return q;
  }
  function orbitPos(q, r, theta, out) {
    out.set(r * Math.cos(theta), 0, r * Math.sin(theta)).applyQuaternion(q);
    return out;
  }
  var V1 = new THREE.Vector3(), V2 = new THREE.Vector3(), V3 = new THREE.Vector3();

  /* a "batch": a string of satellites released on one plane */
  function makeBatch(n, color, size) {
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    var m = new THREE.PointsMaterial({ color: color, size: size, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false });
    var p = new THREE.Points(g, m);
    p.frustumCulled = false;
    scene.add(p);
    return { pts: p, n: n, born: -1, q: null, r: 1, theta0: 0 };
  }
  function updateBatch(b, t) {
    if (b.born < 0) { b.pts.material.opacity = 0; return; }
    var age = t - b.born;
    var pos = b.pts.geometry.attributes.position.array;
    var spread = Math.min(1, age / 5);
    for (var i = 0; i < b.n; i++) {
      var th = b.theta0 + age * 0.22 + i * 0.052 * spread + 0.004 * i;
      orbitPos(b.q, b.r, th, V1);
      pos[i * 3] = V1.x; pos[i * 3 + 1] = V1.y; pos[i * 3 + 2] = V1.z;
    }
    b.pts.geometry.attributes.position.needsUpdate = true;
    b.pts.material.opacity = Math.min(0.95, age * 1.5);
  }

  var batchF = makeBatch(24, 0xffc79a, 0.016);   /* falcon train — ember-white */
  var batchS = makeBatch(64, 0xbfd9ff, 0.016);   /* starship fan — cool white  */

  /* ---------- the mega-constellation (act 3) ---------- */
  var SHELLS = [];
  var swarmGroup = new THREE.Group();
  scene.add(swarmGroup);
  (function () {
    var defs = [
      [53, 0, 1.14, 520], [53, 60, 1.14, 520], [70, 30, 1.19, 480],
      [70, 100, 1.19, 480], [43, 150, 1.24, 420], [86, 75, 1.28, 380]
    ];
    defs.forEach(function (d) {
      var n = d[3];
      var g = new THREE.BufferGeometry();
      var arr = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) {
        var th = (i / n) * Math.PI * 2 + Math.random() * 0.02;
        arr[i * 3] = d[2] * Math.cos(th);
        arr[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
        arr[i * 3 + 2] = d[2] * Math.sin(th);
      }
      g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
      var m = new THREE.PointsMaterial({ color: 0x9fc4ff, size: 0.014, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false });
      var p = new THREE.Points(g, m);
      p.frustumCulled = false;
      p.quaternion.copy(planeQuat(d[0], d[1]));
      swarmGroup.add(p);
      SHELLS.push({ pts: p, r: d[2], speed: 0.05 + 0.05 * Math.random() });
    });
  })();

  /* tracked sats for links (world-space math) */
  var TRACK = [];
  for (var ti = 0; ti < 64; ti++) {
    TRACK.push({
      q: planeQuat([53, 53, 70, 70, 43, 86][ti % 6], [0, 60, 30, 100, 150, 75][ti % 6]),
      r: [1.14, 1.14, 1.19, 1.19, 1.24, 1.28][ti % 6],
      th: Math.random() * Math.PI * 2,
      w: 0.18 + Math.random() * 0.1
    });
  }
  var MAXL = 46;
  var linkGeo = new THREE.BufferGeometry();
  linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAXL * 6), 3));
  var linkMat = new THREE.LineBasicMaterial({ color: 0x5aa2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  var links = new THREE.LineSegments(linkGeo, linkMat);
  links.frustumCulled = false;
  scene.add(links);
  var pairs = [];
  function repick() {
    var ps = TRACK.map(function (s) { return orbitPos(s.q, s.r, s.th, new THREE.Vector3()).clone(); });
    pairs = [];
    for (var i = 0; i < TRACK.length && pairs.length < MAXL - 6; i++) {
      var best = -1, bd = 1e9;
      for (var j = 0; j < TRACK.length; j++) {
        if (j === i) continue;
        var d = ps[i].distanceToSquared(ps[j]);
        if (d < bd && d > 0.004) { bd = d; best = j; }
      }
      if (best >= 0 && bd < 0.16) pairs.push([i, best]);
    }
  }
  repick();
  setInterval(repick, 1400);

  /* ---------- rockets ---------- */
  var loader = new THREE.GLTFLoader();
  var falcon = null, ship = null;
  function prepRocket(gltf, h) {
    var g = gltf.scene;
    var box = new THREE.Box3().setFromObject(g);
    var s = h / (box.max.y - box.min.y);
    g.scale.setScalar(s);
    box.setFromObject(g);
    var c = box.getCenter(new THREE.Vector3());
    var wrap = new THREE.Group();
    g.position.sub(c);
    wrap.add(g);
    wrap.visible = false;
    g.traverse(function (n) { if (n.isMesh && n.material && !n.material.map) { n.material.metalness = 0.3; n.material.roughness = 0.55; } });
    scene.add(wrap);
    return wrap;
  }
  loader.load('assets/models/falcon9.glb', function (g) { falcon = prepRocket(g, 0.23); });
  loader.load('assets/models/starship.glb', function (g) { ship = prepRocket(g, 0.27); });

  /* exhaust plume: a single glowing point trailing the active rocket */
  var plumeGeo = new THREE.BufferGeometry();
  plumeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
  var plumeMat = new THREE.PointsMaterial({ color: 0xffab5e, size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  var plume = new THREE.Points(plumeGeo, plumeMat);
  plume.frustumCulled = false;
  scene.add(plume);

  /* launch path: surface -> insertion, gravity-turn style */
  var LAUNCH_Q = planeQuat(53, 0);
  var thB = 1.75, thA = 1.05;                       /* recomputed to face the camera on start */
  function aimLaunchAtCamera() {
    /* choose the launch plane + angle whose ascent crosses the visible upper face */
    var camDir = camera.position.clone().normalize();
    var bestScore = -1e9;
    for (var rr = 0; rr < 12; rr++) {
      var q = planeQuat(53, rr * 30);
      for (var i = 0; i < 96; i++) {
        var th = i / 96 * Math.PI * 2;
        orbitPos(q, 1.1, th, V1);
        var score = V1.dot(camDir) + 0.5 * V1.y;
        if (score > bestScore) { bestScore = score; LAUNCH_Q = q; thB = th + 0.18; }
      }
    }
    thA = thB - 0.75;
  }
  function flyRocket(rocket, u) {
    /* u 0..1 along ascent */
    if (!rocket) return null;
    var th = thA + (thB - thA) * u;
    var r = 1.005 + (1.135 - 1.005) * (u * u * (3 - 2 * u));
    orbitPos(LAUNCH_Q, r, th, V1);
    rocket.position.copy(V1);
    /* orient: blend radial-up into prograde */
    orbitPos(LAUNCH_Q, r, th + 0.03, V2);
    V3.copy(V1).normalize();                        /* up */
    V2.sub(V1).normalize();                         /* prograde */
    var dir = V3.clone().multiplyScalar(1 - u * 0.92).add(V2.multiplyScalar(u * 0.92)).normalize();
    var quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    rocket.quaternion.copy(quat);
    rocket.visible = true;
    /* plume trails the tail */
    var tail = V1.clone().sub(dir.clone().multiplyScalar(0.09));
    var pp = plumeGeo.attributes.position.array;
    pp[0] = tail.x; pp[1] = tail.y; pp[2] = tail.z;
    plumeGeo.attributes.position.needsUpdate = true;
    plumeMat.opacity = 0.55 + 0.35 * Math.random();
    return th;
  }

  /* ---------- captions ---------- */
  var CAPS = [
    'act i · how it was — falcon 9, ~24 satellites at a time',
    'act ii · the handover — starship, whole shells per flight',
    'act iii · how it will be — thousands, lasing to each other'
  ];
  var capIdx = -1;
  function setCap(i) {
    if (i === capIdx || !capEl) return;
    capIdx = i;
    capEl.style.opacity = 0;
    setTimeout(function () { capEl.textContent = CAPS[i] || ''; capEl.style.opacity = 1; }, 350);
  }

  /* ---------- interaction + loop ---------- */
  var rotY = 0.55, rotX = 0.12, drag = false, px = 0, py = 0, lastDrag = -1e9;
  host.addEventListener('pointerdown', function (e) { drag = true; lastDrag = performance.now(); px = e.clientX; py = e.clientY; host.classList.add('m3d-grab'); if (host.setPointerCapture) host.setPointerCapture(e.pointerId); });
  host.addEventListener('pointermove', function (e) {
    if (!drag) return;
    lastDrag = performance.now();
    rotY += (e.clientX - px) * 0.005;
    rotX = Math.max(-0.9, Math.min(0.9, rotX + (e.clientY - py) * 0.004));
    px = e.clientX; py = e.clientY;
  });
  host.addEventListener('pointerup', function () { drag = false; host.classList.remove('m3d-grab'); });
  host.addEventListener('pointercancel', function () { drag = false; });

  function size() {
    var w = host.clientWidth || 300, h = host.clientHeight || 200;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  if ('ResizeObserver' in window) new ResizeObserver(size).observe(host);
  size();

  var active = false, raf = 0, t0 = performance.now();
  var DUR = 30;
  function frame(now) {
    raf = active && host.isConnected ? requestAnimationFrame(frame) : 0;
    var t = RM ? 22 : ((now - t0) / 1000) % DUR;

    /* auto-steer: keep the action in view unless the user recently took over */
    var autoOK = !drag && !RM && (now - lastDrag > 3500);
    var tracked = (falcon && falcon.visible) ? falcon : ((ship && ship.visible) ? ship : null);
    if (autoOK) {
      if (tracked) {
        var az = Math.atan2(tracked.position.x, tracked.position.z);
        var dAz = ((az - rotY + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        rotY += dAz * 0.022;
      } else {
        rotY += 0.0011;
      }
    }
    var cr = 3.15 - 0.35 * Math.min(1, Math.max(0, (t - 17) / 6));   /* pull back slightly in act 3… actually push in? keep gentle */
    camera.position.set(
      cr * Math.cos(rotX) * Math.sin(rotY),
      cr * Math.sin(rotX) + 0.15,
      cr * Math.cos(rotX) * Math.cos(rotY)
    );
    camera.lookAt(0, 0.05, 0);
    earth.rotation.y += RM ? 0 : 0.0006;

    /* ---- acts ---- */
    var swarmO = 0, linkO = 0;
    if (t < 10) {                                        /* ACT 1: falcon */
      setCap(0);
      if (ship) ship.visible = false;
      if (t < 4.2) {
        flyRocket(falcon, t / 4.2);
        if (batchF.born >= 0 && t < 0.5) { batchF.born = -1; batchS.born = -1; }  /* loop reset */
      } else {
        if (falcon) falcon.visible = false;
        if (batchF.born < 0) { batchF.born = t; batchF.q = LAUNCH_Q; batchF.r = 1.135; batchF.theta0 = thB; }
      }
    } else if (t < 19) {                                 /* ACT 2: starship */
      setCap(1);
      if (falcon) falcon.visible = false;
      if (t < 14.2) {
        flyRocket(ship, (t - 10) / 4.2);
      } else {
        if (ship) ship.visible = false;
        if (batchS.born < 0) { batchS.born = t; batchS.q = LAUNCH_Q; batchS.r = 1.135; batchS.theta0 = thB; }
      }
    } else {                                             /* ACT 3: the constellation */
      setCap(2);
      if (falcon) falcon.visible = false;
      if (ship) ship.visible = false;
      swarmO = Math.min(0.85, (t - 19) / 3);
      linkO = Math.min(0.7, Math.max(0, (t - 20.5) / 3));
    }
    if (RM) { swarmO = 0.85; linkO = 0.5; }

    if (!((falcon && falcon.visible) || (ship && ship.visible))) plumeMat.opacity = 0;
    updateBatch(batchF, t);
    updateBatch(batchS, t);

    SHELLS.forEach(function (s, i) {
      s.pts.material.opacity = swarmO;
      if (!RM) s.pts.rotation.y += s.speed * 0.016;
    });
    TRACK.forEach(function (s) { s.th += s.w * 0.016 * (RM ? 0 : 1); });
    linkMat.opacity = linkO * (RM ? 1 : (0.75 + 0.25 * Math.sin(t * 4)));
    if (linkO > 0) {
      var lp = linkGeo.attributes.position.array;
      var li = 0;
      pairs.forEach(function (pr) {
        var a = orbitPos(TRACK[pr[0]].q, TRACK[pr[0]].r, TRACK[pr[0]].th, V1);
        lp[li++] = a.x; lp[li++] = a.y; lp[li++] = a.z;
        var b = orbitPos(TRACK[pr[1]].q, TRACK[pr[1]].r, TRACK[pr[1]].th, V2);
        lp[li++] = b.x; lp[li++] = b.y; lp[li++] = b.z;
      });
      for (; li < MAXL * 6;) { lp[li++] = 0; }
      linkGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (RM && raf) { cancelAnimationFrame(raf); raf = 0; }   /* one static frame */
  }
  function wake() { if (active && !raf) { raf = requestAnimationFrame(frame); } }

  var started = false;
  var vis = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      active = e.isIntersecting && !document.hidden;
      if (active) { if (!started) { started = true; t0 = performance.now(); camera.position.set(3.15 * Math.cos(rotX) * Math.sin(rotY), 3.15 * Math.sin(rotX) + 0.15, 3.15 * Math.cos(rotX) * Math.cos(rotY)); aimLaunchAtCamera(); } wake(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
  }, { threshold: 0.05 });
  vis.observe(host);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    else wake();
  });
  host.classList.add('m3d-on');
  /* debug handle */
  window.__SXO = { stat: function () {
    return { falcon: falcon ? { v: falcon.visible, p: falcon.position.toArray().map(function(x){return +x.toFixed(3);}) } : 'unloaded',
             ship: ship ? { v: ship.visible } : 'unloaded',
             thA: +thA.toFixed(2), thB: +thB.toFixed(2), started: started,
             t: ((performance.now() - t0) / 1000) % DUR };
  } };
})();
