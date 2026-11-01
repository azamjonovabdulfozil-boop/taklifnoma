(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const env = document.getElementById('env'), cover = document.getElementById('cover'), main = document.getElementById('main'), mbtn = document.getElementById('music');
  document.body.classList.add('locked');

  /* ===== Music: uploaded song, looped, fading in and out ===== */
  const song = new Audio('song.mp3'); song.loop = true; song.preload = 'auto'; song.volume = 0;
  let playing = false, fadeT;
  function fade(to, ms, done){
    clearInterval(fadeT); const from = song.volume, t0 = performance.now();
    fadeT = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); song.volume = from + (to - from) * k; if (k >= 1){ clearInterval(fadeT); done && done(); } }, 40);
  }
  function startMusic(){
    const p = song.play(); if (p && p.catch) p.catch(() => { playing = false; mbtn.classList.remove('on'); });
    fade(.85, 2500);
    playing = true; mbtn.classList.add('on'); mbtn.setAttribute('aria-label', "Musiqani o'chirish");
  }
  function stopMusic(){
    fade(0, 900, () => song.pause());
    playing = false; mbtn.classList.remove('on'); mbtn.setAttribute('aria-label', 'Musiqani yoqish');
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) song.pause(); else if (!document.hidden && playing) song.play().catch(()=>{}); });
  mbtn.addEventListener('click', () => playing ? stopMusic() : startMusic());

  /* ===== Open ===== */
  let opened = false;
  const rvs = [...document.querySelectorAll('.rv')];
  env.addEventListener('click', () => {
    if (opened) return; opened = true;
    env.classList.add('open'); startMusic(); burst = 60;
    setTimeout(() => {
      cover.classList.add('gone'); document.body.classList.remove('locked'); document.body.classList.add('ready');
      main.setAttribute('aria-hidden', 'false'); mbtn.hidden = false;
      if (!reduce && 'IntersectionObserver' in window){
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.remove('hide'); io.unobserve(e.target); } }), {threshold:.15});
        rvs.forEach(r => { if (r.getBoundingClientRect().top > innerHeight){ r.classList.add('hide'); io.observe(r); } });
      }
    }, reduce ? 50 : 2400);
  });

  /* ===== Parallax ===== */
  const pars = [...document.querySelectorAll('[data-par]')];
  if (!reduce) addEventListener('scroll', () => requestAnimationFrame(() => pars.forEach(p => {
    const r = p.parentElement.getBoundingClientRect(); p.style.transform = 'translateY(' + ((r.top + r.height/2 - innerHeight/2) * -.12) + 'px)';
  })), {passive:true});

  /* ===== Countdown ===== */
  const target = new Date('2026-11-22T13:00:00+05:00').getTime(), pd = n => String(n).padStart(2, '0');
  function tick(){
    let d = Math.max(0, target - Date.now()) / 1000;
    const D = Math.floor(d/86400); d -= D*86400; const H = Math.floor(d/3600); d -= H*3600; const M = Math.floor(d/60), S = Math.floor(d - M*60);
    [['cd-d',D],['cd-h',H],['cd-m',M],['cd-s',S]].forEach(([id,v]) => document.getElementById(id).textContent = pd(v));
  }
  tick(); setInterval(tick, 1000);

  /* ===== Lightbox ===== */
  const imgs = [...document.querySelectorAll('#gal img')], lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
  let cur = 0, tx = 0;
  const show = i => { cur = (i + imgs.length) % imgs.length; lbimg.src = imgs[cur].src; lbimg.alt = imgs[cur].alt; };
  document.querySelectorAll('#gal button').forEach(b => b.addEventListener('click', () => { show(+b.dataset.i); lb.hidden = false; lb.querySelector('.x').focus(); }));
  lb.querySelector('.x').onclick = () => lb.hidden = true;
  lb.querySelector('.pv').onclick = e => { e.stopPropagation(); show(cur - 1); };
  lb.querySelector('.nx').onclick = e => { e.stopPropagation(); show(cur + 1); };
  lb.addEventListener('click', e => { if (e.target === lb) lb.hidden = true; });
  lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') lb.hidden = true; if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

  /* ===== Petals ===== */
  const cv = document.getElementById('petals'), c = cv.getContext('2d'); let W, H, burst = 0; const ps = [];
  const cols = ['#c9a25a','#ecd6a4','#a3182c','#e7a3ae','#ffffff'];
  function size(){ const r = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W*r; cv.height = H*r; c.setTransform(r,0,0,r,0,0); }
  function add(top){ ps.push({x:Math.random()*W, y: top ? -20 : Math.random()*H, r:4+Math.random()*6, vy:.4+Math.random()*.9, vx:-.3+Math.random()*.6, a:Math.random()*6.28, va:-.03+Math.random()*.06, sw:Math.random()*6.28, col:cols[Math.floor(Math.random()*cols.length)]}); }
  size(); addEventListener('resize', size);
  if (!reduce){
    for (let i = 0; i < 16; i++) add(false);
    (function fr(){
      c.clearRect(0,0,W,H);
      if (burst > 0){ add(true); burst--; }
      if (ps.length < 18 && Math.random() < .04) add(true);
      for (let i = ps.length - 1; i >= 0; i--){
        const p = ps[i]; p.sw += .02; p.x += p.vx + Math.sin(p.sw)*.5; p.y += p.vy; p.a += p.va;
        c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = .7; c.fillStyle = p.col; c.beginPath(); c.ellipse(0,0,p.r,p.r*.55,0,0,Math.PI*2); c.fill(); c.restore();
        if (p.y > H + 20) ps.splice(i, 1);
      }
      requestAnimationFrame(fr);
    })();
  }
})();
