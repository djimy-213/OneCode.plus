/* My Work: hovering a project card enlarges it (CSS) and shows its name, text and link. */
(function () {
  var cards = [].slice.call(document.querySelectorAll('.wcard'));
  var bg = document.getElementById('wBg');
  var nameEl = document.getElementById('wName');
  var descEl = document.getElementById('wDesc');
  var visit = document.getElementById('wVisit');
  if (!cards.length) return;
  var current = null, timer = 0;

  function show(card, instant) {
    if (card === current) return;
    current = card;
    var img = card.querySelector('img');
    var apply = function () {
      if (bg && img) bg.style.backgroundImage = 'url("' + img.getAttribute('src') + '")';
      if (nameEl) nameEl.textContent = card.dataset.name || '';
      if (descEl) descEl.textContent = card.dataset.desc || '';
      if (visit) visit.href = card.href;
      if (bg) bg.style.opacity = '';
    };
    clearTimeout(timer);
    if (instant || !bg) { apply(); return; }
    bg.style.opacity = '0';
    timer = setTimeout(apply, 200);
  }

  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function () { show(card); });
    card.addEventListener('focus', function () { show(card); });
  });
  show(cards[0], true);
})();
