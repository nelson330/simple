(() => {
  let catalogPages = [...document.querySelectorAll('.page')];
  const embedMatch = window.location.hash.match(/^#embed-page-(\d+)$/);

  if (embedMatch && catalogPages.length) {
    const requestedPage = Math.max(0, Math.min(catalogPages.length - 1, Number(embedMatch[1]) - 1));
    const selectedPage = catalogPages[requestedPage];
    catalogPages.forEach((page) => {
      if (page !== selectedPage) page.remove();
    });
    catalogPages = selectedPage ? [selectedPage] : [];
    document.querySelector('.print-action')?.remove();
    document.body.classList.add('catalog-embed');
  }
  const pages = catalogPages.length
    ? catalogPages
    : [...document.querySelectorAll('main.cover')];

  if (!pages.length) return;

  const entries = pages.map((page) => {
    const width = page.offsetWidth;
    const height = page.offsetHeight;
    const frame = document.createElement('div');
    frame.className = 'page-frame';
    frame.setAttribute('aria-label', page.getAttribute('aria-label') || 'Página del catálogo');
    page.before(frame);
    frame.appendChild(page);
    return { frame, page, width, height };
  });

  const fitPages = () => {
    const sideSpace = document.body.classList.contains('catalog-embed')
      ? 0
      : window.innerWidth <= 380 ? 16 : 24;
    const availableWidth = Math.max(1, window.innerWidth - sideSpace);

    entries.forEach(({ frame, page, width, height }) => {
      const scale = Math.min(1, availableWidth / width);
      frame.style.width = `${width * scale}px`;
      frame.style.height = `${height * scale}px`;
      page.style.transform = `scale(${scale})`;
    });
  };

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(fitPages);
  }, { passive: true });

  window.addEventListener('beforeprint', () => {
    entries.forEach(({ page }) => {
      page.style.removeProperty('transform');
    });
  });

  window.addEventListener('afterprint', fitPages);
  fitPages();
  document.body.classList.add('catalog-responsive-ready');
})();
