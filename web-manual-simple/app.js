const sections = [...document.querySelectorAll('.story-section')];
const dots = document.querySelector('#nav-dots');
const current = document.querySelector('#current-slide');
const total = document.querySelector('#total-slides');
const fill = document.querySelector('#progress-fill');
const label = document.querySelector('#progress-label');
const scrollHint = document.querySelector('.cursor-note');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex = -1;
let requestedIndex = null;
let requestedIndexTimer;
let scrollFrame;

if (total) total.textContent = String(sections.length).padStart(2, '0');

const clearRevealClasses = (element) => {
  element.classList.remove('reveal', 'reveal-delay', 'reveal-delay-2');
};

const addMotionItem = (element) => {
  clearRevealClasses(element);
  element.classList.add('motion-item');
};

// Divide los bloques editoriales para animar sus piezas por separado.
const motionGroups = document.querySelectorAll([
  '.hero-copy',
  '.section-heading',
  '.audience-board',
  '.manifesto',
  '.stacked-products',
  '.mood-grid',
  '.chromatic-board',
  '.palette-detail',
  '.gradient-system',
  '.type-stage',
  '.type-rationale',
  '.icon-system-grid',
  '.language-copy',
  '.balance-board',
  '.decision-grid',
  '.closing-copy',
  '.closing-collage'
].join(','));

const nestedGroups = '.harmony-notes, .rationale-list, .color-role-grid, .section-heading > div';
const addGroupChildren = (group) => {
  clearRevealClasses(group);
  [...group.children].forEach((child) => {
    if (child.matches(nestedGroups)) addGroupChildren(child);
    else addMotionItem(child);
  });
};

motionGroups.forEach(addGroupChildren);
document.querySelectorAll('.reveal').forEach(addMotionItem);

sections.forEach((section, sectionIndex) => {
  const title = section.querySelector('h1, h2');
  if (title) {
    addMotionItem(title);
    title.classList.add('title-motion', `title-motion-${sectionIndex % 4}`);
  }

  const imageContainers = [];
  section.querySelectorAll('img').forEach((image) => {
    const container = image.closest('figure, .image-card, .stack-image, .mood-tile, .closing-photo, .decision-photo')
      || image.parentElement;
    if (!container || imageContainers.includes(container)) return;
    imageContainers.push(container);
    container.classList.add('image-pulse');
    image.classList.add('image-pulse-media');
  });

  const pulseSlot = 3.4;
  const pulseCycle = Math.max(6.8, imageContainers.length * pulseSlot);
  imageContainers.forEach((container, imageIndex) => {
    const image = container.querySelector('img');
    const delay = 1 + (imageIndex * pulseSlot);
    container.style.setProperty('--pulse-cycle', `${pulseCycle}s`);
    container.style.setProperty('--pulse-delay', `${delay}s`);
    image?.style.setProperty('--pulse-cycle', `${pulseCycle}s`);
    image?.style.setProperty('--pulse-delay', `${delay}s`);
  });

  const items = [...section.querySelectorAll('.motion-item')];
  items.forEach((item, index) => {
    item.style.setProperty('--enter-delay', `${Math.min(index * 55, 385)}ms`);
    item.style.setProperty('--exit-delay', `${Math.min((items.length - index - 1) * 24, 168)}ms`);
  });
});

const headerHeight = () => document.querySelector('.site-header')?.offsetHeight || 0;
const visualCenter = () => headerHeight() + ((window.innerHeight - headerHeight()) / 2);

const nearestSectionIndex = () => {
  const center = visualCenter();
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const distance = center < rect.top
      ? rect.top - center
      : center > rect.bottom
        ? center - rect.bottom
        : 0;

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
};

const setActiveSection = (index) => {
  if (index === activeIndex) return;
  activeIndex = index;

  sections.forEach((section, sectionIndex) => {
    section.classList.toggle('is-visible', sectionIndex === index);
    section.classList.toggle('is-before', sectionIndex < index);
    section.classList.toggle('is-after', sectionIndex > index);
  });

  const section = sections[index];
  if (!section) return;
  if (current) current.textContent = String(index + 1).padStart(2, '0');
  if (fill) fill.style.width = `${((index + 1) / sections.length) * 100}%`;
  if (label) label.textContent = section.dataset.label;
  document.querySelectorAll('.nav-dot').forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
  document.body.classList.toggle('ui-on-dark', section.matches('.type-section, .color-origin'));
  if (scrollHint) scrollHint.hidden = index > 0;
};

const updateSectionFromScroll = () => {
  scrollFrame = undefined;
  setActiveSection(nearestSectionIndex());
};

const centerSection = (index, behavior = reducedMotion.matches ? 'auto' : 'smooth') => {
  const section = sections[index];
  if (!section) return;

  const sectionTop = window.scrollY + section.getBoundingClientRect().top;
  const availableCenter = headerHeight() + ((window.innerHeight - headerHeight()) / 2);
  const isTallerThanViewport = section.offsetHeight > window.innerHeight * 1.08;
  const targetTop = isTallerThanViewport
    ? sectionTop
    : sectionTop + (section.offsetHeight / 2) - availableCenter;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  window.scrollTo({
    top: Math.min(maxScroll, Math.max(0, targetTop)),
    behavior
  });
};

const requestSection = (index) => {
  requestedIndex = index;
  centerSection(index);
  window.clearTimeout(requestedIndexTimer);
  requestedIndexTimer = window.setTimeout(() => {
    requestedIndex = null;
  }, reducedMotion.matches ? 100 : 900);
};

sections.forEach((section, index) => {
  const dot = document.createElement('button');
  dot.className = 'nav-dot';
  dot.type = 'button';
  dot.title = section.dataset.label;
  dot.setAttribute('aria-label', `Ir a ${section.dataset.label}`);
  dot.addEventListener('click', () => requestSection(index));
  dots?.appendChild(dot);
});

requestAnimationFrame(() => setActiveSection(nearestSectionIndex()));

window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(updateSectionFromScroll);
}, { passive: true });

window.addEventListener('resize', () => {
  if (scrollFrame) cancelAnimationFrame(scrollFrame);
  scrollFrame = requestAnimationFrame(updateSectionFromScroll);
});

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

  event.preventDefault();
  const direction = event.key === 'ArrowDown' ? 1 : -1;
  const baseIndex = requestedIndex ?? nearestSectionIndex();
  const nextIndex = Math.min(sections.length - 1, Math.max(0, baseIndex + direction));
  requestSection(nextIndex);
});

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  const index = sections.indexOf(target);
  if (index < 0) return;
  event.preventDefault();
  history.replaceState(null, '', link.getAttribute('href'));
  requestSection(index);
});

window.addEventListener('load', () => {
  if (!window.location.hash) return;
  const target = document.querySelector(window.location.hash);
  const index = sections.indexOf(target);
  if (index >= 0) centerSection(index, 'auto');
});
