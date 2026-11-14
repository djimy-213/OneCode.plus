/* Hex grid background: faint hexagons lit by a soft light that follows the cursor.
   Plain canvas, no libraries. Colors match the site palette. */
(function () {
  var cv = document.getElementById('hexbg');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SIZE = 38;                       // hexagon radius in px
  var LINE = [109, 179, 255];          // site sky blue (grid lines)
  var GLOW = [47, 107, 255];           // site button blue (light)
  var R = 170;                         // light radius in px
  var W = 1, H = 1, dpr = 1, base = null, raf = 0, last = 0, t = 0, visible = true;
  var lx = -9999, ly = -9999, tx = 0, ty = 0, active = false, idleSince = 0;
  var hexW = Math.sqrt(3) * SIZE, rowH = SIZE * 1.5;
  var cells = [];

  function hexPath(c, x, y, s) {
    c.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 180 * (60 * i - 30);
      var px = x + s * Math.cos(a), py = y + s * Math.sin(a);
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.closePath();
  }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = document.documentElement.clientWidth || innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    cells = [];
    base = document.createElement('canvas');
    base.width = cv.width; base.height = cv.height;
    var b = base.getContext('2d');
    b.scale(dpr, dpr);
    b.strokeStyle = rgba(LINE, 0.09);
    b.lineWidth = 1;
    var rows = Math.ceil(H / rowH) + 2, cols = Math.ceil(W / hexW) + 2;
    for (var r = -1; r < rows; r++) {
      for (var c = -1; c < cols; c++) {
        var x = c * hexW + (r & 1 ? hexW / 2 : 0), y = r * rowH;
        hexPath(b, x, y, SIZE - 1);
        b.stroke();
        cells.push([x, y]);
      }
    }
    draw();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(base, 0, 0, W, H);
    if (lx < -999) return;
    // soft light
    var g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R);
    g.addColorStop(0, rgba(GLOW, 0.20));
    g.addColorStop(0.45, rgba(GLOW, 0.07));
    g.addColorStop(1, rgba(GLOW, 0));
    ctx.fillStyle = g;
    ctx.fillRect(lx - R, ly - R, R * 2, R * 2);
    // lit hexagons near the light
    for (var i = 0; i < cells.length; i++) {
      var x = cells[i][0], y = cells[i][1];
      var d = Math.hypot(x - lx, y - ly);
      if (d > R) continue;
      var k = 1 - d / R; k = k * k;
      hexPath(ctx, x, y, SIZE - 1);
      ctx.fillStyle = rgba(GLOW, 0.10 * k);
      ctx.fill();
      ctx.strokeStyle = rgba(LINE, 0.10 + 0.55 * k);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    if (!active && now - idleSince > 2500) {      // drift slowly when the mouse is idle
      tx = W * (0.5 + 0.32 * Math.sin(t * 0.35));
      ty = H * (0.42 + 0.22 * Math.sin(t * 0.27 + 1.3));
    }
    if (lx < -999) { lx = tx; ly = ty; }
    var k = 1 - Math.exp(-dt * 7);
    lx += (tx - lx) * k; ly += (ty - ly) * k;
    draw();
    if (visible && !RM) raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && visible && !RM) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  addEventListener('pointermove', function (e) {
    tx = e.clientX; ty = e.clientY; active = true; idleSince = performance.now();
    clearTimeout(start._t); start._t = setTimeout(function () { active = false; }, 2500);
  }, { passive: true });
  addEventListener('resize', build);
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; start(); });

  tx = W * 0.5; ty = H * 0.4;
  build();
  if (RM) { lx = W * 0.5; ly = H * 0.4; draw(); } else start();
})();
