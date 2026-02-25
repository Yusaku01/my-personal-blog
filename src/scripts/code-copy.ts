let cleanupCodeCopy: (() => void) | null = null;

type CopyState = 'idle' | 'success' | 'error';
const COPY_BUTTON_REVEAL_DELAY_MS = 250;

const COPY_MESSAGES: Record<CopyState, string> = {
  idle: 'コードをコピー',
  success: 'コピーしました',
  error: 'コピーに失敗しました',
};

const ensureLiveRegion = (root: HTMLElement): HTMLElement => {
  const existing = root.querySelector<HTMLElement>('[data-code-copy-live]');
  if (existing) {
    return existing;
  }

  const liveRegion = document.createElement('p');
  liveRegion.setAttribute('data-code-copy-live', 'true');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.className = 'code-copy-live';
  root.appendChild(liveRegion);
  return liveRegion;
};

const updateButtonState = (
  button: HTMLButtonElement,
  state: CopyState,
  message: string,
  liveRegion: HTMLElement
) => {
  button.setAttribute('data-copy-state', state);
  button.setAttribute('aria-label', message);
  button.setAttribute('data-copy-feedback', state === 'idle' ? '' : message);
  liveRegion.textContent = message;
};

const updateButtonVisibility = (button: HTMLButtonElement, visible: boolean) => {
  button.setAttribute('data-copy-visible', visible ? 'true' : 'false');
};

const createCopyIcon = (iconClassName: string, stateClassName: string): HTMLSpanElement => {
  const icon = document.createElement('span');
  icon.classList.add(iconClassName, 'code-copy-icon', stateClassName);
  icon.setAttribute('aria-hidden', 'true');
  return icon;
};

const getCodeFilename = (preElement: HTMLElement): string | null => {
  const rawFilename = preElement.getAttribute('data-code-filename');
  if (!rawFilename) {
    return null;
  }

  const normalizedFilename = rawFilename.trim();
  return normalizedFilename.length > 0 ? normalizedFilename : null;
};

const ensureCodeFileLabel = (wrapper: HTMLElement, filename: string | null) => {
  const existingLabel = wrapper.querySelector<HTMLElement>('[data-code-file-label]');

  if (!filename) {
    existingLabel?.remove();
    return;
  }

  const label = existingLabel ?? document.createElement('span');
  label.className = 'code-file-label';
  label.setAttribute('data-code-file-label', 'true');
  label.textContent = filename;

  if (!existingLabel) {
    wrapper.insertBefore(label, wrapper.firstChild);
  }
};

const ensureCopyButton = (preElement: HTMLElement): HTMLButtonElement => {
  const parent = preElement.parentElement;
  if (parent && parent.classList.contains('code-block-wrapper')) {
    const existingButton = parent.querySelector<HTMLButtonElement>('[data-code-copy-button]');
    if (existingButton) {
      return existingButton;
    }
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'code-block-wrapper';

  preElement.parentNode?.insertBefore(wrapper, preElement);
  wrapper.appendChild(preElement);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-button';
  button.setAttribute('data-code-copy-button', 'true');
  button.setAttribute('data-copy-state', 'idle');
  button.setAttribute('aria-label', COPY_MESSAGES.idle);
  button.setAttribute('title', COPY_MESSAGES.idle);
  button.setAttribute('data-copy-feedback', '');
  button.setAttribute('data-copy-visible', 'false');
  button.appendChild(createCopyIcon('i-ic-round-content-copy', 'code-copy-icon--copy'));
  button.appendChild(createCopyIcon('i-ic-round-check', 'code-copy-icon--success'));

  wrapper.appendChild(button);
  return button;
};

const getCodeText = (preElement: HTMLElement): string => {
  const codeElement = preElement.querySelector('code');
  if (codeElement && typeof codeElement.textContent === 'string') {
    return codeElement.textContent;
  }

  return preElement.textContent ?? '';
};

const fallbackCopyText = (text: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } finally {
    textarea.remove();
  }

  return copied;
};

const copyCodeText = async (code: string): Promise<boolean> => {
  if (!code) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      // fall through to legacy copy path
    }
  }

  return fallbackCopyText(code);
};

const initCodeCopy = (): (() => void) => {
  const contentRoot = document.querySelector<HTMLElement>('[data-blog-content]');
  if (!contentRoot) {
    return () => {};
  }

  const codeBlocks = Array.from(contentRoot.querySelectorAll<HTMLElement>('pre.astro-code'));
  if (codeBlocks.length === 0) {
    return () => {};
  }

  const liveRegion = ensureLiveRegion(contentRoot);
  const controller = new AbortController();
  const { signal } = controller;
  const resetTimers = new Set<number>();

  codeBlocks.forEach((preElement) => {
    const button = ensureCopyButton(preElement);
    let resetTimer: number | undefined;
    let revealTimer: number | undefined;
    const wrapper = button.parentElement;

    if (!(wrapper instanceof HTMLElement)) {
      return;
    }

    ensureCodeFileLabel(wrapper, getCodeFilename(preElement));

    if (!preElement.hasAttribute('tabindex')) {
      preElement.setAttribute('tabindex', '0');
    }

    const clearRevealTimer = () => {
      if (typeof revealTimer === 'number') {
        window.clearTimeout(revealTimer);
        resetTimers.delete(revealTimer);
        revealTimer = undefined;
      }
    };

    const scheduleButtonReveal = () => {
      clearRevealTimer();
      revealTimer = window.setTimeout(() => {
        updateButtonVisibility(button, true);
        if (typeof revealTimer === 'number') {
          resetTimers.delete(revealTimer);
          revealTimer = undefined;
        }
      }, COPY_BUTTON_REVEAL_DELAY_MS);
      resetTimers.add(revealTimer);
    };

    const hideButton = () => {
      clearRevealTimer();
      updateButtonVisibility(button, false);
    };

    wrapper.addEventListener('pointerenter', scheduleButtonReveal, { signal });
    wrapper.addEventListener('pointerleave', hideButton, { signal });
    wrapper.addEventListener(
      'pointerdown',
      () => {
        clearRevealTimer();
        updateButtonVisibility(button, true);
      },
      { signal }
    );
    wrapper.addEventListener('focusin', scheduleButtonReveal, { signal });
    wrapper.addEventListener(
      'focusout',
      (event) => {
        const nextFocused = event.relatedTarget;
        if (nextFocused instanceof Node && wrapper.contains(nextFocused)) {
          return;
        }
        hideButton();
      },
      { signal }
    );

    button.addEventListener(
      'click',
      async () => {
        updateButtonVisibility(button, true);
        const code = getCodeText(preElement);

        if (!code) {
          updateButtonState(button, 'error', COPY_MESSAGES.error, liveRegion);
          return;
        }

        try {
          const copied = await copyCodeText(code);
          if (!copied) {
            throw new Error('Clipboard unavailable');
          }

          updateButtonState(button, 'success', COPY_MESSAGES.success, liveRegion);
        } catch {
          updateButtonState(button, 'error', COPY_MESSAGES.error, liveRegion);
        }

        if (typeof resetTimer === 'number') {
          window.clearTimeout(resetTimer);
          resetTimers.delete(resetTimer);
        }

        resetTimer = window.setTimeout(() => {
          updateButtonState(button, 'idle', COPY_MESSAGES.idle, liveRegion);
          if (typeof resetTimer === 'number') {
            resetTimers.delete(resetTimer);
          }
        }, 1800);
        resetTimers.add(resetTimer);
      },
      { signal }
    );
  });

  return () => {
    controller.abort();
    resetTimers.forEach((timer) => window.clearTimeout(timer));
    resetTimers.clear();
  };
};

const setupCodeCopy = () => {
  cleanupCodeCopy?.();
  cleanupCodeCopy = initCodeCopy();
};

export const bindCodeCopy = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCodeCopy, { once: true });
  } else {
    setupCodeCopy();
  }

  document.addEventListener('astro:page-load', setupCodeCopy);
  document.addEventListener('astro:after-swap', setupCodeCopy);
};
