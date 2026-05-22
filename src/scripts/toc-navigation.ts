let cleanupTocNavigation: (() => void) | null = null;

const HEADER_HEIGHT = 64;
const SCROLL_THRESHOLD = 80;
const DESKTOP_BREAKPOINT = '(min-width: 1280px)';
const SIDEBAR_SCROLL_MARGIN = 8;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

const isDesktopViewport = (): boolean => window.matchMedia(DESKTOP_BREAKPOINT).matches;

const trapFocus = (container: HTMLElement, e: KeyboardEvent): void => {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

const initTocNavigation = (): (() => void) => {
  const contentRoot = document.querySelector<HTMLElement>('[data-blog-content]');
  const root = document.querySelector<HTMLElement>('[data-toc-root]');
  const toggle = root?.querySelector<HTMLButtonElement>('[data-toc-toggle]');
  const panel = root?.querySelector<HTMLElement>('[data-toc-panel]');
  const backdrop = root?.querySelector<HTMLElement>('[data-toc-backdrop]');
  const closeBtn = root?.querySelector<HTMLButtonElement>('[data-toc-close]');
  const nav = root?.querySelector<HTMLElement>('[data-toc-nav]');

  if (!contentRoot || !root || !toggle || !panel || !backdrop || !closeBtn || !nav) {
    return () => {};
  }

  const headingEls = Array.from(contentRoot.querySelectorAll<HTMLElement>('h2, h3'));
  const tocLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
  if (headingEls.length < 2 || tocLinks.length < 2) {
    return () => {};
  }

  const controller = new AbortController();
  const { signal } = controller;
  const timers = new Set<number>();
  const tocOpenLabel = root.dataset.tocOpenLabel ?? '目次を開く';
  const tocCloseLabel = root.dataset.tocCloseLabel ?? '目次を閉じる';

  let activeSlug: string | null = null;
  let isPanelOpen = false;
  let lastScroll = 0;

  const applyPanelA11yState = (): void => {
    if (isDesktopViewport()) {
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
      panel.removeAttribute('aria-hidden');
      return;
    }

    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-hidden', isPanelOpen ? 'false' : 'true');
  };

  const openPanel = (): void => {
    if (isDesktopViewport()) return;

    window.dispatchEvent(new CustomEvent('header-menu:close'));
    isPanelOpen = true;
    root.classList.add('toc-root--open');
    panel.classList.add('toc-panel--open');
    backdrop.classList.add('toc-panel-backdrop--visible');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', tocCloseLabel);
    document.body.style.overflow = 'hidden';
    applyPanelA11yState();
    closeBtn.focus();
  };

  const closePanel = (options: { restoreFocus?: boolean } = {}): void => {
    isPanelOpen = false;
    root.classList.remove('toc-root--open');
    panel.classList.remove('toc-panel--open');
    backdrop.classList.remove('toc-panel-backdrop--visible');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', tocOpenLabel);
    document.body.style.overflow = '';
    applyPanelA11yState();

    if (options.restoreFocus) {
      toggle.focus();
    }
  };

  const handleBarScroll = (): void => {
    if (isPanelOpen || isDesktopViewport()) return;
    const currentScroll = window.scrollY;

    if (currentScroll <= 0) {
      toggle.classList.remove('toc-mobile-bar--hidden');
    } else if (currentScroll > lastScroll && currentScroll > SCROLL_THRESHOLD) {
      toggle.classList.add('toc-mobile-bar--hidden');
    } else {
      toggle.classList.remove('toc-mobile-bar--hidden');
    }

    lastScroll = currentScroll;
  };

  const scrollToHeading = (slug: string): void => {
    const target = document.getElementById(slug);
    if (!target) return;

    const barHeight = !isDesktopViewport() ? toggle.offsetHeight : 0;
    const offset = HEADER_HEIGHT + barHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: scrollBehavior() });
  };

  const scrollNavToActiveLink = (link: HTMLElement): void => {
    if (!isDesktopViewport() || nav.offsetParent === null || nav.scrollHeight <= nav.clientHeight) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    if (linkRect.top < navRect.top + SIDEBAR_SCROLL_MARGIN) {
      const delta = linkRect.top - navRect.top - SIDEBAR_SCROLL_MARGIN;
      nav.scrollTo({
        top: nav.scrollTop + delta,
        behavior: scrollBehavior(),
      });
      return;
    }

    if (linkRect.bottom > navRect.bottom - SIDEBAR_SCROLL_MARGIN) {
      const delta = linkRect.bottom - navRect.bottom + SIDEBAR_SCROLL_MARGIN;
      nav.scrollTo({
        top: nav.scrollTop + delta,
        behavior: scrollBehavior(),
      });
    }
  };

  const setActiveHeading = (slug: string): void => {
    if (slug === activeSlug) return;
    activeSlug = slug;

    for (const link of tocLinks) {
      const isActive = link.getAttribute('data-toc-link') === slug;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        scrollNavToActiveLink(link);
      }
    }
  };

  toggle.addEventListener(
    'click',
    () => {
      if (isPanelOpen) {
        closePanel({ restoreFocus: true });
      } else {
        openPanel();
      }
    },
    { signal }
  );
  closeBtn.addEventListener('click', () => closePanel({ restoreFocus: true }), { signal });
  backdrop.addEventListener('click', () => closePanel(), { signal });
  window.addEventListener('toc-panel:close', () => closePanel(), { signal });
  window.addEventListener('scroll', handleBarScroll, { signal, passive: true });
  window.addEventListener(
    'resize',
    () => {
      if (isPanelOpen && isDesktopViewport()) {
        closePanel();
      } else {
        applyPanelA11yState();
      }
    },
    { signal }
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (!isPanelOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel({ restoreFocus: true });
      }
      if (e.key === 'Tab') {
        trapFocus(panel, e);
      }
    },
    { signal }
  );

  for (const link of tocLinks) {
    link.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        const slug = link.getAttribute('data-toc-link');
        if (!slug) return;

        if (isPanelOpen) {
          closePanel();
          const timer = window.setTimeout(() => {
            scrollToHeading(slug);
            timers.delete(timer);
          }, 50);
          timers.add(timer);
          return;
        }

        scrollToHeading(slug);
      },
      { signal }
    );
  }

  if (tocLinks.length > 0) {
    const firstSlug = tocLinks[0].getAttribute('data-toc-link');
    if (firstSlug) {
      setActiveHeading(firstSlug);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const intersecting = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (intersecting.length > 0) {
        const target = intersecting[0].target as HTMLElement;
        if (target.id) {
          setActiveHeading(target.id);
        }
      }
    },
    {
      root: null,
      rootMargin: `-${HEADER_HEIGHT + 16}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  for (const el of headingEls) {
    observer.observe(el);
  }

  applyPanelA11yState();
  handleBarScroll();

  return () => {
    controller.abort();
    observer.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
    document.body.style.overflow = '';
    closePanel();
  };
};

const setupTocNavigation = (): void => {
  cleanupTocNavigation?.();
  cleanupTocNavigation = initTocNavigation();
};

export const bindTocNavigation = (): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTocNavigation, { once: true });
  } else {
    setupTocNavigation();
  }

  document.addEventListener('astro:page-load', setupTocNavigation);
  document.addEventListener('astro:after-swap', setupTocNavigation);
};
