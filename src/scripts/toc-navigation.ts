let cleanupTocNavigation: (() => void) | null = null;

interface TocHeading {
  slug: string;
  text: string;
  depth: number;
}

const HEADER_HEIGHT = 64;
const SCROLL_THRESHOLD = 80;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

// ── Build nested TOC HTML (reusable for panel) ──────────────────────────
const buildPanelTocHtml = (headings: TocHeading[]): string => {
  interface Node {
    heading: TocHeading;
    children: Node[];
  }

  const root: { children: Node[] } = { children: [] };
  const stack: { depth: number; children: Node[] }[] = [{ depth: 0, children: root.children }];

  for (const h of headings) {
    const node: Node = { heading: h, children: [] };
    while (stack.length > 1 && h.depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push({ depth: h.depth, children: node.children });
  }

  const render = (nodes: Node[]): string => {
    if (nodes.length === 0) return '';
    let html = '<ol class="toc-panel-list">';
    for (const n of nodes) {
      html += '<li>';
      html += `<a href="#${n.heading.slug}" class="toc-panel-link" data-toc-panel-link="${n.heading.slug}">${n.heading.text}</a>`;
      html += render(n.children);
      html += '</li>';
    }
    html += '</ol>';
    return html;
  };

  return render(root.children);
};

// ── Focus trap helper ───────────────────────────────────────────────────
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

// ── Main init ───────────────────────────────────────────────────────────
const initTocNavigation = (): (() => void) => {
  const contentRoot = document.querySelector<HTMLElement>('[data-blog-content]');
  const sidebar = document.querySelector<HTMLElement>('[data-toc-sidebar]');
  const mobileMount = document.querySelector<HTMLElement>('[data-toc-mobile]');

  if (!contentRoot || !mobileMount) {
    return () => {};
  }

  // Gather heading elements from rendered content
  const headingEls = Array.from(contentRoot.querySelectorAll<HTMLElement>('h2, h3'));
  if (headingEls.length < 2) {
    return () => {};
  }

  // Read heading data from sidebar data attribute or from DOM
  let headings: TocHeading[];
  if (sidebar) {
    const raw = sidebar.getAttribute('data-toc-headings');
    headings = raw ? (JSON.parse(raw) as TocHeading[]) : [];
  } else {
    headings = headingEls.map((el) => ({
      slug: el.id,
      text: el.textContent?.trim() ?? '',
      depth: parseInt(el.tagName[1], 10),
    }));
  }

  if (headings.length < 2) {
    return () => {};
  }

  const controller = new AbortController();
  const { signal } = controller;
  const timers = new Set<number>();

  // ── State ───────────────────────────────────────────────────────────
  let activeSlug: string | null = null;
  let isPanelOpen = false;

  // ── Mobile TOC bar ──────────────────────────────────────────────────
  const bar = document.createElement('div');
  bar.className = 'toc-mobile-bar';
  bar.innerHTML = `
    <button
      class="toc-mobile-btn"
      type="button"
      aria-expanded="false"
      aria-controls="toc-slide-panel"
      aria-label="目次を開く"
      data-toc-open-btn
    >
      <span class="i-ic-round-list" aria-hidden="true"></span>
      <span>目次</span>
    </button>
  `;
  mobileMount.appendChild(bar);

  const openBtn = bar.querySelector<HTMLButtonElement>('[data-toc-open-btn]')!;

  // ── Slide-in panel ──────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'toc-panel-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');

  const panel = document.createElement('div');
  panel.className = 'toc-panel';
  panel.id = 'toc-slide-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', '目次');
  panel.innerHTML = `
    <div class="toc-panel-header">
      <span class="toc-panel-title">目次</span>
      <button
        class="toc-panel-close"
        type="button"
        aria-label="目次を閉じる"
        data-toc-close-btn
      >
        <span class="i-ic-round-close" aria-hidden="true"></span>
      </button>
    </div>
    <nav class="toc-panel-body" aria-label="目次">
      ${buildPanelTocHtml(headings)}
    </nav>
  `;

  mobileMount.appendChild(backdrop);
  mobileMount.appendChild(panel);

  const closeBtn = panel.querySelector<HTMLButtonElement>('[data-toc-close-btn]')!;
  const panelLinks = Array.from(panel.querySelectorAll<HTMLAnchorElement>('[data-toc-panel-link]'));

  // ── Panel open / close ──────────────────────────────────────────────
  const openPanel = (): void => {
    isPanelOpen = true;
    panel.classList.add('toc-panel--open');
    backdrop.classList.add('toc-panel-backdrop--visible');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  const closePanel = (): void => {
    isPanelOpen = false;
    panel.classList.remove('toc-panel--open');
    backdrop.classList.remove('toc-panel-backdrop--visible');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    openBtn.focus();
  };

  openBtn.addEventListener('click', openPanel, { signal });
  closeBtn.addEventListener('click', closePanel, { signal });
  backdrop.addEventListener('click', closePanel, { signal });

  document.addEventListener(
    'keydown',
    (e) => {
      if (!isPanelOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      }
      if (e.key === 'Tab') {
        trapFocus(panel, e);
      }
    },
    { signal }
  );

  // ── Scroll: sync mobile bar with header ─────────────────────────────
  let lastScroll = 0;

  const handleBarScroll = (): void => {
    if (isPanelOpen) return;
    const currentScroll = window.scrollY;

    if (currentScroll <= 0) {
      bar.classList.remove('toc-mobile-bar--hidden');
    } else if (currentScroll > lastScroll && currentScroll > SCROLL_THRESHOLD) {
      bar.classList.add('toc-mobile-bar--hidden');
    } else {
      bar.classList.remove('toc-mobile-bar--hidden');
    }

    lastScroll = currentScroll;
  };

  window.addEventListener('scroll', handleBarScroll, { signal, passive: true });

  // ── Smooth scroll on TOC link click ─────────────────────────────────
  const scrollToHeading = (slug: string): void => {
    const target = document.getElementById(slug);
    if (!target) return;

    const barHeight = window.innerWidth < 1280 ? bar.offsetHeight : 0;
    const offset = HEADER_HEIGHT + barHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: scrollBehavior() });
  };

  // Sidebar links (SSR-rendered)
  if (sidebar) {
    const sidebarLinks = Array.from(sidebar.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));
    for (const link of sidebarLinks) {
      link.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          const slug = link.getAttribute('data-toc-link');
          if (slug) scrollToHeading(slug);
        },
        { signal }
      );
    }
  }

  // Panel links
  for (const link of panelLinks) {
    link.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        const slug = link.getAttribute('data-toc-panel-link');
        closePanel();
        if (slug) {
          // Small delay so the panel close animation doesn't interfere
          const t = window.setTimeout(() => {
            scrollToHeading(slug);
            timers.delete(t);
          }, 50);
          timers.add(t);
        }
      },
      { signal }
    );
  }

  // ── IntersectionObserver: active heading tracking ───────────────────
  const setActiveHeading = (slug: string): void => {
    if (slug === activeSlug) return;
    activeSlug = slug;

    // Update sidebar
    if (sidebar) {
      const prev = sidebar.querySelector('.toc-sidebar-link.is-active');
      prev?.classList.remove('is-active');
      const next = sidebar.querySelector<HTMLElement>(`[data-toc-link="${slug}"]`);
      next?.classList.add('is-active');
      // Auto-scroll sidebar to keep active link visible
      next?.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
    }

    // Update panel
    for (const link of panelLinks) {
      link.classList.toggle('is-active', link.getAttribute('data-toc-panel-link') === slug);
    }
  };

  // Set initial active heading
  if (headings.length > 0) {
    setActiveHeading(headings[0].slug);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      // Find the topmost intersecting heading
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

  // ── Cleanup ─────────────────────────────────────────────────────────
  return () => {
    controller.abort();
    observer.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
    document.body.style.overflow = '';

    // Remove dynamically created elements
    bar.remove();
    backdrop.remove();
    panel.remove();
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
