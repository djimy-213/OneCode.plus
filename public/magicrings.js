/* MagicRings - glowing, spinning, pulsing rings drawn on a canvas (no libraries).
   Props follow the React Bits MagicRings usage example. */
(function () {
  function rgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + Math.max(0, Math.min(1, a)) + ')'; }

  function MagicRings(canvas, opts) {
    var o = Object.assign({
      color: '#A855F7', colorTwo: '#6366F1', motion: 'pulse', ringCount: 6, speed: 1,
      lineThickness: 2, glow: 1, hoverScale: 1.2, clickBurst: true, baseRadius: 0.23,
      expansion: 0.08, taper: 1.6, spin: 0.55, host: canvas.parentElement
    }, opts || {});
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;
    var c1 = rgb(o.color), c2 = rgb(o.colorTwo);
    var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var TAU = Math.PI * 2;
    var W = 1, H = 1, dpr = 1, t = 0, last = 0, raf = 0, visible = true;
    var scale = 1, target = 1, ox = 0, oy = 0, tx = 0, ty = 0, kick = 0, bursts = [];
    var hasConic = typeof ctx.createConicGradient === 'function';

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      draw(0);
    }

    function ring(cx, cy, r, lw, a, angle) {
      var stroke;
      if (hasConic) {
        stroke = ctx.createConicGradient(angle, cx, cy);
        stroke.addColorStop(0, rgba(c1, a));
        stroke.addColorStop(0.3, rgba(c2, a));
        stroke.addColorStop(0.55, rgba(c2, a * 0.05));
        stroke.addColorStop(0.78, rgba(c1, a * 0.05));
        stroke.addColorStop(1, rgba(c1, a));
      } else stroke = rgba(c1, a * 0.8);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lw;
      ctx.shadowColor = rgba(c1, a);
      ctx.shadowBlur = 16 * o.glow * dpr;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(r, 0.1), 0, TAU); ctx.stroke();
    }

    function draw(now) {
      var m = Math.min(W, H) * dpr;
      var cx = (W / 2 + ox) * dpr, cy = (H / 2 + oy) * dpr, n = Math.max(1, o.ringCount | 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < n; i++) {
        var k = n > 1 ? i / (n - 1) : 0;
        var fall = Math.pow(1 / o.taper, k);
        var wave = o.motion === 'pulse' ? Math.sin(t * 2.2 - i * 0.8) : 0;
        var r = (o.baseRadius + i * o.expansion) * m * scale * (1 + 0.035 * wave);
        var lw = Math.max(0.6, o.lineThickness * fall * (1 + 0.25 * wave)) * dpr;
        var a = fall * (0.78 + 0.22 * wave);
        var ang = t * o.spin * (i % 2 ? -1 : 1) * (1 + i * 0.15) + i * 1.3;
        ring(cx, cy, r, lw, a, ang);
      }
      for (var b = bursts.length - 1; b >= 0; b--) {
        var age = (now - bursts[b].t0) / 1200;
        if (age >= 1) { bursts.splice(b, 1); continue; }
        var e = 1 - Math.pow(1 - age, 3);
        ring(bursts[b].x * dpr, bursts[b].y * dpr, e * 0.6 * m, (3 - 2 * age) * dpr, Math.pow(1 - age, 2), 0);
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
      kick += (0 - kick) * (1 - Math.exp(-dt * 2.5));
      t += dt * o.speed * (1 + kick * 3);
      scale += (target - scale) * (1 - Math.exp(-dt * 6));
      ox += (tx - ox) * (1 - Math.exp(-dt * 4));
      oy += (ty - oy) * (1 - Math.exp(-dt * 4));
      draw(now);
      if (visible && !RM) raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !RM) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    var host = o.host;
    host.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') target = o.hoverScale; });
    host.addEventListener('pointerleave', function () { target = 1; tx = 0; ty = 0; });
    host.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var rc = host.getBoundingClientRect();
      tx = (e.clientX - rc.left - rc.width / 2) * 0.035;
      ty = (e.clientY - rc.top - rc.height / 2) * 0.035;
    });
    if (o.clickBurst) {
      host.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('a,button,input')) return;
        var rc = canvas.getBoundingClientRect();
        bursts.push({ x: e.clientX - rc.left, y: e.clientY - rc.top, t0: performance.now() });
        kick = 1; start();
      });
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; start(); }).observe(canvas);
    resize(); start();
    return { options: o };
  }

  window.MagicRings = MagicRings;
  var cv = document.getElementById('magicRings');
  if (cv) MagicRings(cv, {
    host: document.getElementById('top'),
    color: '#A855F7', colorTwo: '#6366F1', motion: 'pulse', ringCount: 6, speed: 1,
    lineThickness: 2, glow: 1, hoverScale: 1.2, clickBurst: true, baseRadius: 0.23,
    expansion: 0.08, taper: 1.6, spin: 0.55
  });
})();
