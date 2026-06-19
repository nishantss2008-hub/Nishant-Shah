/* ============================================================
   enhance.js — portfolio micro-interactions & polish layer
   Features: 09 custom cursor · 02 typewriter · 07 day ticker ·
   96 scroll-to-top · 21 3D tilt · 73 scroll wash · 65 blur-up
   All feature-detected & guarded; safe to load on any page.
   ============================================================ */
(function () {
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;

  /* 09 — custom cursor */
  if (false) {
    document.documentElement.classList.add('has-cursor');
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    document.body.appendChild(ring); document.body.appendChild(dot);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; });
    (function loop() { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) { if (e.target.closest && e.target.closest('a,button,.card-hover,[role=button],input,textarea')) document.body.classList.add('cursor-hot'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest && e.target.closest('a,button,.card-hover,[role=button],input,textarea')) document.body.classList.remove('cursor-hot'); });
  }

  /* 02 — typewriter tagline */
  var tl = document.getElementById('typeline');
  if (tl) {
    var ph = (tl.getAttribute('data-words') || 'Founder.,Builder.,Storyteller.').split(',');
    var pi = 0, ci = 0, del = false;
    (function tick() {
      var w = ph[pi]; tl.textContent = w.slice(0, ci);
      if (!del) { ci++; if (ci > w.length) { del = true; setTimeout(tick, 1200); return; } }
      else { ci--; if (ci < 0) { del = false; pi = (pi + 1) % ph.length; ci = 0; } }
      setTimeout(tick, del ? 45 : 90);
    })();
  }

  /* 07 — "day N of building" ticker */
  var dn = document.getElementById('dayN');
  if (dn) { var start = new Date(dn.getAttribute('data-start') || '2021-09-01'); dn.textContent = Math.floor((Date.now() - start) / 86400000).toLocaleString(); }

  /* 96 — scroll to top */
  var tt = document.createElement('button'); tt.className = 'totop'; tt.setAttribute('aria-label', 'Back to top');
  tt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(tt);
  tt.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });
  addEventListener('scroll', function () { if (scrollY > innerHeight * 2.2) tt.classList.add('show'); else tt.classList.remove('show'); }, { passive: true });

  /* 21 — 3D tilt on project / feature cards */
  if (fine) {
    [].forEach.call(document.querySelectorAll('.ccard'), function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateY(' + (px * 9) + 'deg) rotateX(' + (-py * 9) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* 73 — scroll-linked color wash */
  var ov = document.createElement('div'); ov.className = 'scrollwash'; document.body.appendChild(ov);
  addEventListener('scroll', function () {
    var max = (document.body.scrollHeight - innerHeight) || 1, p = Math.min(1, scrollY / max);
    ov.style.opacity = (0.05 + p * 0.06).toFixed(3);
    ov.style.background = 'linear-gradient(180deg, hsla(' + (222 - p * 46) + ',70%,55%,0.6), transparent 70%)';
  }, { passive: true });

  /* 65 — image blur-up */
  [].forEach.call(document.querySelectorAll('img[loading]'), function (im) {
    if (im.complete) im.classList.add('imgloaded');
    else im.addEventListener('load', function () { im.classList.add('imgloaded'); });
  });
  /* 15 — reading progress (case-study pages) */
  if (document.querySelector('.cs-hero')) { var rb=document.createElement('div'); rb.className='readbar'; document.body.appendChild(rb); addEventListener('scroll',function(){ var m=(document.body.scrollHeight-innerHeight)||1; rb.style.width=(Math.min(1,scrollY/m)*100)+'%'; },{passive:true}); }
  /* 31 — lightbox (photo carousel) */
  (function(){ var imgs=[].slice.call(document.querySelectorAll('.pphoto')); if(!imgs.length) return; var lb=document.createElement('div'); lb.className='lightbox'; lb.innerHTML='<button class="lb-close" aria-label="Close">\u2715</button><button class="lb-prev" aria-label="Previous">\u2039</button><img class="lb-img" alt=""><button class="lb-next" aria-label="Next">\u203a</button>'; document.body.appendChild(lb); var srcs=imgs.map(function(el){ var im=el.querySelector('img'); return im?im.src:''; }).filter(Boolean); var i=0, im=lb.querySelector('.lb-img'); function open(n){ i=(n+srcs.length)%srcs.length; im.src=srcs[i]; lb.classList.add('show'); } function close(){ lb.classList.remove('show'); } imgs.forEach(function(el,n){ el.style.cursor='zoom-in'; el.addEventListener('click',function(e){ e.preventDefault(); open(n); }); }); lb.querySelector('.lb-close').onclick=close; lb.querySelector('.lb-next').onclick=function(){open(i+1);}; lb.querySelector('.lb-prev').onclick=function(){open(i-1);}; lb.addEventListener('click',function(e){ if(e.target===lb) close(); }); addEventListener('keydown',function(e){ if(!lb.classList.contains('show'))return; if(e.key==='Escape')close(); if(e.key==='ArrowRight')open(i+1); if(e.key==='ArrowLeft')open(i-1); }); })();
  /* 19 — keyboard section nav (Left/Right) */
  (function(){ var secs=[].slice.call(document.querySelectorAll('section[id]')); if(secs.length<2)return; function cur(){ var y=scrollY+innerHeight*0.3, idx=0; secs.forEach(function(s,n){ if(s.offsetTop<=y) idx=n; }); return idx; } addEventListener('keydown',function(e){ if(e.target&&e.target.matches&&e.target.matches('input,textarea'))return; if(document.querySelector('.lightbox.show'))return; if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ var n=cur()+(e.key==='ArrowRight'?1:-1); n=Math.max(0,Math.min(secs.length-1,n)); scrollTo({top:secs[n].offsetTop,behavior:'smooth'}); e.preventDefault(); } }); })();
  /* 04 — ambient particle field */
  (function(){ var cv=document.getElementById('heroParticles'); if(!cv)return; var ctx=cv.getContext('2d'),W,H,ps=[],mx=0,my=0; function rs(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; } rs(); addEventListener('resize',rs); for(var k=0;k<46;k++) ps.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.6+0.4,vx:(Math.random()-0.5)*0.16,vy:(Math.random()-0.5)*0.16}); addEventListener('mousemove',function(e){ mx=(e.clientX/innerWidth-0.5); my=(e.clientY/innerHeight-0.5); }); (function loop(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='rgba(120,160,250,0.55)'; ps.forEach(function(pt){ pt.x+=pt.vx+mx*0.25; pt.y+=pt.vy+my*0.25; if(pt.x<0)pt.x=W; if(pt.x>W)pt.x=0; if(pt.y<0)pt.y=H; if(pt.y>H)pt.y=0; ctx.beginPath(); ctx.arc(pt.x,pt.y,pt.r,0,6.2832); ctx.fill(); }); requestAnimationFrame(loop); })(); })();
  /* 91/37 — manifesto type-on-scroll */
  (function(){ var p=document.getElementById('manifestoP'); if(!p)return; var t1=p.querySelector('.t1'),t2=p.querySelector('.t2'),car=p.querySelector('.tcaret'); if(!t1)return; function type(el,txt,cb){ var i=0; (function s(){ el.textContent=txt.slice(0,i); i++; if(i<=txt.length) setTimeout(s,24); else cb&&cb(); })(); } var done=false; var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting&&!done){ done=true; io.disconnect(); type(t1,t1.getAttribute('data-t'),function(){ type(t2,t2.getAttribute('data-t'),function(){ if(car) car.style.opacity='0'; }); }); } }); },{threshold:0.45}); io.observe(p); })();
})();
