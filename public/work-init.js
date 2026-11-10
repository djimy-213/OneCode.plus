/* My Work section: starts the FlexCarousel (React Bits). */
import { createFlexCarousel, flexCarouselReady } from './flexcarousel.js';

var stage = document.getElementById('workStage');

/* Slides. With one slide the page shows it as a large linked image; with two or more it becomes the 3D carousel. */
var items = [
  { src: '/work/elegance-clothes.jpg', alt: 'Elegance Clothes website: home page', title: 'Elegance Clothes', subtitle: 'Visit the website \u2197', href: 'https://elegance-clothes.vercel.app/' }
];

function showFallback() { stage.classList.add('fallback'); }

if (stage && items.length < 2) {
  stage.dataset.ready = '1';
  stage.classList.add('fallback', 'single');
} else if (stage) {
  try {
    if (!flexCarouselReady) throw new Error('ogl not loaded');
    var mount = document.createElement('div');
    mount.className = 'wmount';
    stage.appendChild(mount);
    var api = createFlexCarousel(mount, {
      items: items,
      label: 'My work',
      preset: 'liquid',
      intro: 'rise',
      cardHeight: 0.6,
      gap: 14,
      radius: 22,
      squeeze: 0.2,
      focusOnClick: false,   // clicking the centered card opens its website
      captions: true,
      captureWheel: true,    // mouse wheel over the slides scrolls the carousel
      onSelect: function (i, item) { if (item && item.href) window.open(item.href, '_blank', 'noopener'); }
    });
    if (api) {
      stage.dataset.ready = '1';
      stage.classList.remove('fallback');
      var fall = stage.querySelector('.wfall');
      if (fall) fall.remove();
    } else {
      mount.remove();
      showFallback();
    }
  } catch (err) {
    console.warn('My Work carousel unavailable, showing fallback:', err);
    showFallback();
  }
}
