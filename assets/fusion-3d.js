/* ============================================================
   fusion-3d.js — the real machines, in your hands.
   Interactive 3D of the actual device geometry:
   · ITER tokamak — built from the ITER Organization's official
     3D-printable magnet files (TF/PF coils + central solenoid),
     assembled to the published coil positions; plasma is the
     ITER D-shaped equilibrium (R=6.2 m, a=2 m, κ=1.7, δ=0.33).
   · Wendelstein 7-X — Proxima Fusion's open_stellarator_models
     (MIT): 50 non-planar coils + the twisted plasma surface.
   THREE r128 + GLTFLoader (assets/vendor/GLTFLoader.js).
   Lazy: nothing is fetched until the panel nears the viewport.
   ============================================================ */
(function () {
  if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') return;
  var hosts = document.querySelectorAll('.m3d');
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loader = new THREE.GLTFLoader();
  var live = [];   // {host, renderer} — dynamically opened panels get disposed once detached

  function boot(host) {
    if (host.__m3d) return;
    host.__m3d = true;
    /* reclaim contexts from panels no longer in the DOM (re-opened cards) */
    for (var li = live.length - 1; li >= 0; li--) {
      if (!live[li].host.isConnected) {
        try { live[li].renderer.dispose(); live[li].renderer.forceContextLoss(); } catch (e) {}
        live.splice(li, 1);
      }
    }
    var src = host.getAttribute('data-src');
    var hasGlow = !!host.getAttribute('data-glow');
    var glow = new THREE.Color(host.getAttribute('data-glow') || '#ffffff');
    var emit = new THREE.Color(host.getAttribute('data-emit') || host.getAttribute('data-glow') || '#ffffff');
    var spin = parseFloat(host.getAttribute('data-spin')) || 1;
    var dist = parseFloat(host.getAttribute('data-dist')) || 2.65;
    var elev = parseFloat(host.getAttribute('data-elev')) || 0.36;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) { host.classList.add('m3d-fail'); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    var group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0x93a4c4, 0x14161f, 0.62));
    var sun = new THREE.DirectionalLight(0xf4f6ff, 0.85);
    sun.position.set(2.5, 3, 1.5);
    scene.add(sun);
    var core = null;
    if (hasGlow) {
      core = new THREE.PointLight(glow.getHex(), 1.7, 6);
      core.position.set(0, 0, 0);
      scene.add(core);
    }

    var plasmaMats = [];
    var loaded = false, active = false, raf = 0;

    /* orbit state (drag + gentle idle spin) */
    var theta = -0.6 * spin, phi = elev;           // yaw / elevation
    var tTheta = theta, tPhi = phi;
    var dragging = false, px = 0, py = 0, t0 = 0;

    function place() {
      var r = dist;
      camera.position.set(
        r * Math.cos(phi) * Math.sin(theta),
        r * Math.sin(phi),
        r * Math.cos(phi) * Math.cos(theta)
      );
      camera.lookAt(0, 0, 0);
    }

    function size() {
      var w = host.clientWidth || 300, h = host.clientHeight || 220;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    function frame(t) {
      if (!host.isConnected) { active = false; raf = 0; return; }
      raf = active ? requestAnimationFrame(frame) : 0;
      if (!loaded) return;
      if (!dragging && !RM) tTheta += 0.0032 * spin;
      theta += (tTheta - theta) * 0.09;
      phi += (tPhi - phi) * 0.09;
      place();
      if (!RM && plasmaMats.length) {
        var pulse = 0.85 + 0.22 * Math.sin(t * 0.0021) + 0.07 * Math.sin(t * 0.0093);
        for (var i = 0; i < plasmaMats.length; i++) plasmaMats[i].emissiveIntensity = pulse;
        if (core) core.intensity = 1.55 + 0.4 * Math.sin(t * 0.0021);
      }
      renderer.render(scene, camera);
    }

    function wake() { if (active && !raf) raf = requestAnimationFrame(frame); }

    loader.load(src, function (gltf) {
      gltf.scene.traverse(function (n) {
        if (!n.isMesh) return;
        var m = n.material;
        if (!m) return;
        if (/plasma/i.test(m.name || n.name)) {
          m.emissive = emit.clone();
          m.emissiveIntensity = 0.85;
          m.color = new THREE.Color(0x0a0503);
          m.metalness = 0; m.roughness = 1;
          if (plasmaMats.indexOf(m) < 0) plasmaMats.push(m);
        } else if (!m.map) {
          m.metalness = 0.35; m.roughness = 0.5;
        }
      });
      /* frame the model: normalize so its bounding sphere fits the orbit */
      var box = new THREE.Box3().setFromObject(gltf.scene);
      var sph = box.getBoundingSphere(new THREE.Sphere());
      var s = 1.06 / (sph.radius || 1);
      gltf.scene.scale.setScalar(s);
      gltf.scene.position.copy(sph.center).multiplyScalar(-s);
      group.add(gltf.scene);
      live.push({ host: host, renderer: renderer });
      loaded = true;
      host.classList.add('m3d-on');
      wake();
    }, undefined, function () { host.classList.add('m3d-fail'); });

    /* drag to orbit — vertical page scroll stays native (touch-action: pan-y) */
    host.addEventListener('pointerdown', function (e) {
      dragging = true; px = e.clientX; py = e.clientY; t0 = tTheta;
      host.classList.add('m3d-grab');
      if (host.setPointerCapture) host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      tTheta += (e.clientX - px) * 0.011;
      tPhi = Math.min(1.25, Math.max(-0.2, tPhi + (e.clientY - py) * 0.007));
      px = e.clientX; py = e.clientY;
      if (Math.abs(tTheta - t0) > 0.05) host.classList.add('m3d-moved');
      wake();
    });
    function drop() { dragging = false; host.classList.remove('m3d-grab'); }
    host.addEventListener('pointerup', drop);
    host.addEventListener('pointercancel', drop);

    if ('ResizeObserver' in window) new ResizeObserver(size).observe(host);
    else window.addEventListener('resize', size, { passive: true });
    size(); place();

    /* render only while on screen */
    var vis = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        active = e.isIntersecting && !document.hidden;
        if (active) wake(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      });
    }, { threshold: 0.02 });
    vis.observe(host);
    document.addEventListener('visibilitychange', function () {
      active = !document.hidden;
      if (active) wake(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    });
  }

  /* lazy-boot each static panel as it approaches */
  if (hosts.length && 'IntersectionObserver' in window) {
    var near = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { near.unobserve(e.target); boot(e.target); }
      });
    }, { rootMargin: '400px 0px' });
    hosts.forEach(function (h) { near.observe(h); });
  } else {
    hosts.forEach(boot);
  }

  window.M3D = { boot: boot };
})();
