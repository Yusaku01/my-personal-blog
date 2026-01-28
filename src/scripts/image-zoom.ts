let cleanupImageZoom: (() => void) | null = null;

const initImageZoom = (): (() => void) => {
  const contentRoot = document.querySelector<HTMLElement>('[data-blog-content]');
  const modal = document.getElementById('blog-image-modal');
  const modalImage = document.getElementById('blog-image-modal-img');

  if (!contentRoot || !modal || !(modalImage instanceof HTMLImageElement)) {
    return () => {};
  }

  const controller = new AbortController();
  const { signal } = controller;

  const openModal = (image: HTMLImageElement) => {
    const src = image.currentSrc || image.getAttribute('src');
    if (!src) return;
    modalImage.setAttribute('src', src);
    modalImage.setAttribute('alt', image.getAttribute('alt') ?? '');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('overflow-hidden');
  };

  contentRoot.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;
      event.preventDefault();
      openModal(target);
    },
    { signal }
  );

  modal.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      const isCloseTarget = target instanceof Element && target.closest('[data-modal-close]');
      if (target === modal || isCloseTarget) {
        closeModal();
      }
    },
    { signal }
  );

  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    },
    { signal }
  );

  return () => controller.abort();
};

const setupImageZoom = () => {
  cleanupImageZoom?.();
  cleanupImageZoom = initImageZoom();
};

export const bindImageZoom = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageZoom, { once: true });
  } else {
    setupImageZoom();
  }

  document.addEventListener('astro:page-load', setupImageZoom);
  document.addEventListener('astro:after-swap', setupImageZoom);
};
