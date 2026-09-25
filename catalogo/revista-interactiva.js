const PAGE_COUNT = 21;
const desktopMedia = window.matchMedia('(min-width: 901px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const stage = document.querySelector('#book-stage');
const loadingCard = document.querySelector('#loading-card');
const gestureHint = document.querySelector('#gesture-hint');

const pad = (number) => String(number).padStart(2, '0');
const pages = Array.from({ length: PAGE_COUNT }, (_, index) => `revista-pages/page-${pad(index + 1)}.jpg`);
let pageFlip;

const updateInterface = (index = pageFlip?.getCurrentPageIndex() || 0) => {
  document.title = `Simple — Página ${index + 1} de ${PAGE_COUNT}`;
};

const hideHint = () => {
  gestureHint.hidden = true;
};

pageFlip = new St.PageFlip(stage, {
  width: 992,
  height: 1404,
  size: 'stretch',
  minWidth: 240,
  maxWidth: 992,
  minHeight: 340,
  maxHeight: 1404,
  autoSize: false,
  usePortrait: true,
  showCover: false,
  drawShadow: true,
  maxShadowOpacity: .42,
  flippingTime: reducedMotion.matches ? 180 : 780,
  mobileScrollSupport: false,
  swipeDistance: 24,
  showPageCorners: true,
  disableFlipByClick: false
});

pageFlip.on('init', (event) => {
  loadingCard.hidden = true;
  updateInterface(event.data.page);
});
pageFlip.on('flip', (event) => {
  updateInterface(event.data);
  hideHint();
});
pageFlip.on('changeOrientation', () => updateInterface());
pageFlip.on('changeState', (event) => {
  stage.classList.toggle('is-turning', event.data !== 'read');
  if (event.data === 'user_fold' || event.data === 'flipping') hideHint();
});

pageFlip.loadFromImages(pages);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') pageFlip.flipNext('top');
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') pageFlip.flipPrev('top');
});

desktopMedia.addEventListener('change', () => {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
    updateInterface();
  });
});
