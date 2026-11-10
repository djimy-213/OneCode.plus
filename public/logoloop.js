/* LogoLoop - endless, seamless row of logos (plain JS, no libraries).
   Options follow the React Bits LogoLoop usage example. */
(function () {
  function LogoLoop(root, o) {
    o = Object.assign({ logos: [], speed: 60, direction: 'left', logoHeight: 46, gap: 18, hoverSpeed: 0,
      scaleOnHover: true, fadeOut: true, ariaLabel: 'Logos' }, o || {});
    var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('ll');
    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', o.ariaLabel);
    root.style.setProperty('--ll-h', o.logoHeight + 'px');
    root.style.setProperty('--ll-gap', o.gap + 'px');
    if (o.fadeOut) root.classList.add('ll-fade');
    if (o.scaleOnHover) root.classList.add('ll-scale');

    var track = document.createElement('div');
    track.className = 'll-track';
    root.appendChild(track);

    function item(l, hidden) {
      var a = document.createElement(l.href ? 'a' : 'div');
      a.className = 'll-item';
      if (l.href) { a.href = l.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      if (l.title) { a.title = l.title; a.setAttribute('aria-label', l.title); }
      if (l.hoverColor) a.style.setProperty('--hc', l.hoverColor);
      if (hidden) { a.setAttribute('aria-hidden', 'true'); a.tabIndex = -1; }
      a.innerHTML = l.svg + (l.title ? '<span class="ll-name">' + l.title + '</span>' : '');
      return a;
    }

    var setW = 0, copies = 2, x = 0, speed = o.speed, target = o.speed, raf = 0, last = 0, visible = true;
    var dir = (o.direction === 'right') ? 1 : -1;

    function build() {
      track.innerHTML = '';
      o.logos.forEach(function (l) { track.appendChild(item(l, false)); });
      setW = track.scrollWidth;
      copies = Math.max(2, Math.ceil(root.clientWidth / Math.max(setW, 1)) + 1);
      for (var c = 1; c < copies; c++) o.logos.forEach(function (l) { track.appendChild(item(l, true)); });
      if (dir > 0) x = -setW;
    }
    function frame(now) {
      raf = 0;
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      speed += (target - speed) * (1 - Math.exp(-dt * 8));
      x += dir * speed * dt;
      if (dir < 0 && x <= -setW) x += setW;
      if (dir > 0 && x >= 0) x -= setW;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      if (visible && !RM) raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !RM) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    root.addEventListener('pointerenter', function () { target = o.hoverSpeed; });
    root.addEventListener('pointerleave', function () { target = o.speed; });
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; start(); }).observe(root);
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(build, 120); }).observe(root);
    build();
    if (RM) { root.classList.add('ll-static'); } else start();
  }
  window.LogoLoop = LogoLoop;

  var S = 'viewBox="0 0 24 24" aria-hidden="true"';
  var logos = [
    { title: 'React', href: 'https://react.dev/', hoverColor: '#61dafb',
      svg: '<svg ' + S + ' fill="none" stroke="currentColor" stroke-width="1.2"><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/></svg>' },
    { title: 'Next.js', href: 'https://nextjs.org/',
      svg: '<svg ' + S + ' fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M9 16V8l7.5 10M15.5 8v5" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
    { title: 'TypeScript', href: 'https://www.typescriptlang.org/', hoverColor: '#3178c6',
      svg: '<svg ' + S + '><rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/><text x="12.5" y="17" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="10.5" fill="#062240">TS</text></svg>' },
    { title: 'Tailwind CSS', href: 'https://tailwindcss.com/', hoverColor: '#38bdf8',
      svg: '<svg ' + S + ' fill="currentColor"><path d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6C13.7 10.6 15 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.200 0 5.200-1.600 6-4.800-1.200 1.600-2.600 2.200-4.200 1.800-.9-.2-1.600-.9-2.300-1.600C10.300 13.400 9 12 6 12z"/></svg>' },
    { title: 'JavaScript', href: 'https://developer.mozilla.org/docs/Web/JavaScript', hoverColor: '#f7df1e',
      svg: '<svg ' + S + '><rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor"/><text x="12.5" y="17" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="10.5" fill="#062240">JS</text></svg>' },
    { title: 'Node.js', href: 'https://nodejs.org/', hoverColor: '#6cc24a',
      svg: '<svg ' + S + ' fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2l8.7 5v10L12 22l-8.7-5V7z"/><text x="12" y="15.6" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="9" fill="currentColor" stroke="none">N</text></svg>' }
  ];
  var root = document.getElementById('techLoop');
  if (root) LogoLoop(root, { logos: logos, speed: 60, direction: 'left', logoHeight: 46, gap: 18, hoverSpeed: 0, scaleOnHover: true, ariaLabel: 'Technologies we build with' });
})();
