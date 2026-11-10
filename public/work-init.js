/* My Work: the project name and text appear only while a card is hovered; the card itself enlarges (CSS). */
(function () {
  var section = document.getElementById('services');
  var cards = [].slice.call(document.querySelectorAll('.wcard'));
  var nameEl = document.getElementById('wName');
  var descEl = document.getElementById('wDesc');
  if (!section || !cards.length) return;
  var leaveTimer = 0;

  function show(card) {
    clearTimeout(leaveTimer);
    nameEl.textContent = card.dataset.name || '';
    descEl.textContent = card.dataset.desc || '';
    section.classList.add('hovering');
  }
  function hide() {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(function () { section.classList.remove('hovering'); }, 120);
  }
  cards.forEach(function (card) {
    card.addEventListener('pointerenter', function () { show(card); });
    card.addEventListener('pointerleave', hide);
    card.addEventListener('focus', function () { show(card); });
    card.addEventListener('blur', hide);
  });
})();
