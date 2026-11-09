/* My Work section: starts the FlexCarousel (React Bits). */
import { createFlexCarousel, flexCarouselReady } from './flexcarousel.js';

var stage = document.getElementById('workStage');

var items = [
  { src: '/work/web-design.svg', alt: 'Web design: clean, memorable interfaces', title: 'Web design', subtitle: 'Interfaces' },
  { src: '/work/web-development.svg', alt: 'Web development: fast, secure websites and web apps', title: 'Web development', subtitle: 'Fast websites' },
  { src: '/work/e-commerce.svg', alt: 'E-commerce: online stores with simple checkout', title: 'E-commerce', subtitle: 'Online stores' },
  { src: '/work/mobile-apps.svg', alt: 'Mobile apps for iOS and Android', title: 'Mobile apps', subtitle: 'iOS and Android' },
  { src: '/work/dashboards.svg', alt: 'Dashboards and admin tools', title: 'Dashboards', subtitle: 'Smart tools' }
];

function showFallback() { stage.classList.add('fallback'); }

if (stage) {
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
      focusOnClick: true,
      captions: true,
      captureWheel: false,   // vertical mouse wheel keeps scrolling the page
      onSelect: function () {}
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
