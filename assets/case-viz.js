/* ============================================================
   case-viz.js — live wire diagrams for case studies.
   2D-canvas 3D projection (no WebGL): drag to spin, slow idle
   rotation, glow strokes in the spike's accent color.
   Kinds: globe (See Us Now reach), trailer (Mobile Escape Room),
   stage (On Stage proscenium), headset (Eco-Vision).
   Mount: <div data-viz="kind" data-color="#hex"><canvas></canvas></div>
   then CaseViz.mountAll().
   ============================================================ */
(function () {
  'use strict';
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- tiny wire engine ---------- */
  function engine(cv, opts) {
    var c2 = cv.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function rs() {
      W = cv.clientWidth || 300; H = cv.clientHeight || 240;
      cv.width = W * DPR; cv.height = H * DPR;
      c2.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    rs();
    if ('ResizeObserver' in window) new ResizeObserver(rs).observe(cv);
    var st = {
      rot: opts.rot || -0.6, tilt: opts.tilt == null ? 0.42 : opts.tilt,
      vel: RM ? 0 : (opts.vel == null ? 0.0035 : opts.vel),
      drag: false, px: 0, py: 0, tiltMin: opts.tiltMin == null ? 0.05 : opts.tiltMin,
      tiltMax: opts.tiltMax == null ? 1.1 : opts.tiltMax, t0: performance.now()
    };
    cv.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); st.drag = true; st.px = e.clientX; st.py = e.clientY;
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!st.drag) return;
      st.rot += (e.clientX - st.px) * 0.008;
      st.tilt = Math.max(st.tiltMin, Math.min(st.tiltMax, st.tilt + (e.clientY - st.py) * 0.005));
      st.px = e.clientX; st.py = e.clientY;
    });
    cv.addEventListener('pointerup', function () { st.drag = false; });
    cv.addEventListener('pointercancel', function () { st.drag = false; });
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { visible = e.isIntersecting; });
      }, { threshold: 0 }).observe(cv);
    }
    (function loop() {
      if (!cv.isConnected) return;
      requestAnimationFrame(loop);
      if (!visible) return;
      if (!st.drag) st.rot += st.vel;
      var cr = Math.cos(st.rot), sr = Math.sin(st.rot);
      var ct = Math.cos(st.tilt), stl = Math.sin(st.tilt);
      var scale = Math.min(W, H) * (opts.zoom || 0.42);
      var cx = W / 2, cy = H * (opts.cy == null ? 0.56 : opts.cy);
      function P(p) { /* world [x,y,z] (z up) -> screen [sx, sy, depth 0..~1.3] */
        var x = p[0] * cr + p[1] * sr, y = -p[0] * sr + p[1] * cr, z = p[2];
        var y2 = z * ct - y * stl, z2 = z * stl + y * ct;
        var d = (opts.persp || 3.4) / ((opts.persp || 3.4) + z2);
        return [cx + x * scale * d, cy - y2 * scale * d, d];
      }
      c2.clearRect(0, 0, W, H);
      opts.draw(c2, P, (performance.now() - st.t0) / 1000, { W: W, H: H, rot: st.rot });
    })();
    return st;
  }

  function strokeSegs(c2, P, segs, color, glow, lw) {
    c2.lineWidth = lw || 1.3;
    c2.strokeStyle = color;
    c2.shadowColor = glow;
    c2.shadowBlur = 5;
    c2.lineJoin = c2.lineCap = 'round';
    for (var i = 0; i < segs.length; i++) {
      var a = P(segs[i][0]), b = P(segs[i][1]);
      c2.globalAlpha = Math.max(0.16, Math.min(1, (Math.min(a[2], b[2]) - 0.62) * 2.2));
      c2.beginPath(); c2.moveTo(a[0], a[1]); c2.lineTo(b[0], b[1]); c2.stroke();
    }
    c2.globalAlpha = 1;
  }
  function seg(L, a, b) { L.push([a, b]); }
  function box(L, x0, x1, y0, y1, z0, z1) {
    var c = [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
    [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function (e) { seg(L, c[e[0]], c[e[1]]); });
  }
  function circle(L, cx, cy, cz, r, n, axis) {
    var prev = null;
    for (var i = 0; i <= n; i++) {
      var a = i / n * 2 * Math.PI, p;
      if (axis === 'y') p = [cx + r * Math.cos(a), cy, cz + r * Math.sin(a)];
      else if (axis === 'x') p = [cx, cy + r * Math.cos(a), cz + r * Math.sin(a)];
      else p = [cx + r * Math.cos(a), cy + r * Math.sin(a), cz];
      if (prev) seg(L, prev, p);
      prev = p;
    }
  }
  function bez(L, p0, pc, p1, n) {
    var prev = null;
    for (var i = 0; i <= n; i++) {
      var t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
      var p = [a*p0[0]+b*pc[0]+c*p1[0], a*p0[1]+b*pc[1]+c*p1[1], a*p0[2]+b*pc[2]+c*p1[2]];
      if (prev) seg(L, prev, p);
      prev = p;
    }
  }

  /* ---------- globe: See Us Now reach ---------- */
  function globe(cv, color) {
    var TAMPA = [27.95, -82.46];
    var STATES = [[32.8,-86.8],[34.3,-111.7],[34.8,-92.4],[37.2,-119.3],[39,-105.5],[41.6,-72.7],[39,-75.5],[28.6,-82.4],[32.6,-83.4],[44.4,-114.6],[40,-89.2],[39.9,-86.3],[42,-93.5],[38.5,-98.4],[37.5,-85.3],[31,-92],[45.3,-69.2],[39,-76.8],[42.3,-71.8],[44.3,-85.4],[46.3,-94.3],[32.7,-89.7],[38.4,-92.5],[47,-109.6],[41.5,-99.8],[39.3,-116.6],[43.7,-71.6],[40.2,-74.7],[34.4,-106.1],[43,-75.5],[35.5,-79.4],[47.4,-100.5],[40.3,-82.8],[35.6,-97.5],[43.9,-120.6],[40.9,-77.8],[41.7,-71.6],[33.9,-80.9],[44.4,-100.2],[35.8,-86.4],[31.5,-99.4],[39.3,-111.7],[44,-72.7],[37.5,-78.9],[47.4,-120.4],[38.6,-80.6],[44.6,-89.7],[43,-107.6]];
    var FORUMS = [[40.7, -74.0, 'UN · NYC'], [4.61, -74.08, 'WHO · Bogotá'], [-31.07, 26.80, 'Jamestown · South Africa']];
    var land = null;
    fetch('assets/data/land110.json').then(function (r) { return r.json(); }).then(function (j) { land = j; }).catch(function () {});
    function ll2xyz(lat, lon) {
      var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
      return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    }
    var arcs = STATES.map(function (s, i) { return { a: TAMPA, b: s, off: i * 0.35, big: false }; })
      .concat(FORUMS.map(function (f, i) { return { a: TAMPA, b: f, off: 3 + i * 4, big: true }; }));
    engine(cv, {
      rot: 2.0, tilt: 0.5, vel: 0.0028, zoom: 0.44, cy: 0.52, persp: 5, tiltMin: -0.6, tiltMax: 1.2,
      draw: function (c2, P, t) {
        /* limb */
        var ctr = P([0, 0, 0]), edge = P([0, 0, 1]);
        var R = Math.hypot(edge[0] - ctr[0], edge[1] - ctr[1]);
        c2.globalAlpha = 0.5; c2.lineWidth = 1;
        c2.strokeStyle = color; c2.shadowColor = color; c2.shadowBlur = 7;
        c2.beginPath(); c2.arc(ctr[0], ctr[1], R, 0, Math.PI * 2); c2.stroke();
        /* coastlines */
        if (land) {
          c2.lineWidth = 0.8; c2.shadowBlur = 0; c2.globalAlpha = 0.55;
          for (var li = 0; li < land.length; li++) {
            var line = land[li], run = false;
            c2.beginPath();
            for (var k = 0; k < line.length; k++) {
              var p3 = ll2xyz(line[k][1], line[k][0]);
              var s = P(p3);
              if (s[2] > 1.0) { /* front hemisphere (persp d > 1 when z2 < 0) */
                if (!run) { c2.moveTo(s[0], s[1]); run = true; }
                else c2.lineTo(s[0], s[1]);
              } else run = false;
            }
            c2.stroke();
          }
        }
        /* arcs */
        c2.shadowBlur = 6; c2.shadowColor = color;
        for (var ai = 0; ai < arcs.length; ai++) {
          var A = arcs[ai];
          var pa = ll2xyz(A.a[0], A.a[1]), pb = ll2xyz(A.b[0], A.b[1]);
          var prog = RM ? 1 : Math.max(0, Math.min(1, ((t - A.off) % 14) / (A.big ? 3.4 : 2.2)));
          if (prog <= 0) continue;
          var N = 30, drawn = Math.max(2, Math.round(N * prog));
          c2.lineWidth = A.big ? 1.6 : 0.9;
          c2.globalAlpha = A.big ? 0.95 : 0.55;
          c2.strokeStyle = color;
          c2.beginPath();
          var head = null, started = false;
          for (var q = 0; q <= drawn; q++) {
            var tt = q / N;
            var m = [pa[0] + (pb[0] - pa[0]) * tt, pa[1] + (pb[1] - pa[1]) * tt, pa[2] + (pb[2] - pa[2]) * tt];
            var len = Math.hypot(m[0], m[1], m[2]) || 1;
            var lift = 1 + (A.big ? 0.35 : 0.16) * Math.sin(tt * Math.PI);
            var s2 = P([m[0] / len * lift, m[1] / len * lift, m[2] / len * lift]);
            if (s2[2] > 0.98) {
              if (!started) { c2.moveTo(s2[0], s2[1]); started = true; }
              else c2.lineTo(s2[0], s2[1]);
              head = s2;
            } else started = false;
          }
          c2.stroke();
          if (head && prog < 1) {
            c2.globalAlpha = 1; c2.fillStyle = '#fff';
            c2.beginPath(); c2.arc(head[0], head[1], A.big ? 2.2 : 1.4, 0, Math.PI * 2); c2.fill();
          }
        }
        /* Tampa pulse */
        var tp = P(ll2xyz(TAMPA[0], TAMPA[1]));
        if (tp[2] > 1.0) {
          var pulse = RM ? 3 : 2.5 + 1.5 * Math.sin(t * 3);
          c2.globalAlpha = 1; c2.fillStyle = color; c2.shadowBlur = 10;
          c2.beginPath(); c2.arc(tp[0], tp[1], 2.6, 0, Math.PI * 2); c2.fill();
          c2.globalAlpha = 0.35; c2.strokeStyle = color; c2.lineWidth = 1;
          c2.beginPath(); c2.arc(tp[0], tp[1], 3 + pulse, 0, Math.PI * 2); c2.stroke();
        }
        c2.globalAlpha = 1; c2.shadowBlur = 0;
      }
    });
  }

  /* ---------- trailer: Mobile Escape Room cutaway ---------- */
  function trailer(cv, color) {
    var L = [];
    /* body shell (x: length, y: width, z: up) */
    box(L, -1.1, 1.05, -0.5, 0.5, 0.3, 1.25);
    /* side ribs */
    for (var i = 1; i < 5; i++) {
      var x = -1.1 + i * (2.15 / 5);
      seg(L, [x, -0.5, 0.3], [x, -0.5, 1.25]);
      seg(L, [x, 0.5, 0.3], [x, 0.5, 1.25]);
    }
    /* rear doors: right closed (half of the back), left swung open */
    seg(L, [1.05, 0, 0.3], [1.05, 0, 1.25]);                       /* door split line */
    var hx = 1.05, hy = -0.5, ang = 2.2;                            /* hinge at right-rear corner */
    var dx = Math.cos(ang) * 0, dW = 0.5;
    var ox = hx + Math.sin(ang) * dW, oy = hy - (1 - Math.cos(ang)) * dW + dW;
    /* open panel: from hinge [1.05,-0.5] rotate a 0.5-wide panel outward */
    var px = hx + dW * Math.sin(ang), py = hy - dW * (Math.cos(ang) - 1) - dW;
    box(L, hx, hx + dW * Math.sin(ang), hy, hy - dW * Math.cos(ang), 0.3, 1.25);
    /* tongue + coupler */
    seg(L, [-1.1, -0.28, 0.42], [-1.55, 0, 0.36]);
    seg(L, [-1.1, 0.28, 0.42], [-1.55, 0, 0.36]);
    seg(L, [-1.55, 0, 0.36], [-1.68, 0, 0.36]);
    /* wheels + fenders */
    circle(L, 0.42, -0.56, 0.16, 0.17, 16, 'y'); circle(L, 0.42, -0.56, 0.16, 0.06, 8, 'y');
    circle(L, 0.42, 0.56, 0.16, 0.17, 16, 'y'); circle(L, 0.42, 0.56, 0.16, 0.06, 8, 'y');
    bez(L, [0.16, -0.56, 0.3], [0.42, -0.62, 0.56], [0.68, -0.56, 0.3], 10);
    bez(L, [0.16, 0.56, 0.3], [0.42, 0.62, 0.56], [0.68, 0.56, 0.3], 10);
    /* interior: puzzle stations (crates), console, overhead prop line */
    box(L, -0.9, -0.55, -0.3, 0.05, 0.3, 0.62);      /* station 1 */
    box(L, -0.25, 0.1, 0.1, 0.42, 0.3, 0.72);        /* station 2 */
    box(L, 0.35, 0.72, -0.4, -0.05, 0.3, 0.56);      /* station 3 */
    box(L, -1.02, -0.94, -0.4, 0.4, 0.3, 1.0);       /* front-wall console */
    seg(L, [-0.7, 0, 1.25], [0.6, 0, 1.25]);          /* cable run */
    var dots = [[-0.72, -0.12, 0.62], [-0.07, 0.26, 0.72], [0.54, -0.22, 0.56]];
    /* recenter: model spans x -1.68..1.05 (tongue included) — shift so it balances at 0 */
    L.forEach(function (s2) { s2[0] = [s2[0][0] + 0.31, s2[0][1], s2[0][2] - 0.62]; s2[1] = [s2[1][0] + 0.31, s2[1][1], s2[1][2] - 0.62]; });
    dots = dots.map(function (d) { return [d[0] + 0.31, d[1], d[2] - 0.62]; });
    engine(cv, {
      rot: -0.7, tilt: 0.42, zoom: 0.38, cy: 0.5,
      draw: function (c2, P, t) {
        strokeSegs(c2, P, L, color, color);
        /* station beacons */
        for (var i = 0; i < dots.length; i++) {
          var s = P(dots[i]);
          var r = RM ? 2.2 : 2 + 0.9 * Math.sin(t * 2.4 + i * 2.1);
          c2.globalAlpha = 0.95; c2.fillStyle = color; c2.shadowColor = color; c2.shadowBlur = 8;
          c2.beginPath(); c2.arc(s[0], s[1], Math.max(1.2, r), 0, Math.PI * 2); c2.fill();
        }
        c2.globalAlpha = 1; c2.shadowBlur = 0;
      }
    });
  }

  var KINDS = { globe: globe, trailer: trailer };
  window.CaseViz = {
    mountAll: function () {
      document.querySelectorAll('[data-viz]').forEach(function (el) {
        if (el.__viz) return;
        var fn = KINDS[el.getAttribute('data-viz')];
        var cv = el.querySelector('canvas');
        if (!fn || !cv) return;
        el.__viz = true;
        fn(cv, el.getAttribute('data-color') || '#8b93a7');
      });
    }
  };
})();
