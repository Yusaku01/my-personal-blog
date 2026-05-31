type WindowWithContactFormState = Window & {
  __contactFormCleanup?: (() => void) | undefined;
  __contactFormInstalled?: boolean;
  __turnstileReady?: Promise<void>;
  turnstile?: {
    render: (container: HTMLElement, options: { sitekey: string }) => string;
  };
};

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';

const loadTurnstile = (): Promise<void> => {
  const windowWithState = window as WindowWithContactFormState;

  if (windowWithState.turnstile) {
    return Promise.resolve();
  }

  if (windowWithState.__turnstileReady) {
    return windowWithState.__turnstileReady;
  }

  windowWithState.__turnstileReady = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Turnstile script failed')), {
      once: true,
    });
    document.head.append(script);
  });

  return windowWithState.__turnstileReady;
};

const renderTurnstile = (root: ParentNode = document): void => {
  const widgets = Array.from(root.querySelectorAll<HTMLElement>('.cf-turnstile[data-sitekey]'));

  if (!widgets.length) {
    return;
  }

  void loadTurnstile().then(() => {
    const turnstile = (window as WindowWithContactFormState).turnstile;
    if (!turnstile) {
      return;
    }

    widgets.forEach((widget) => {
      if (widget.dataset.turnstileWidgetId) {
        return;
      }

      const sitekey = widget.dataset.sitekey;
      if (!sitekey) {
        return;
      }

      widget.dataset.turnstileWidgetId = turnstile.render(widget, { sitekey });
    });
  });
};

export const initContactFormEnhancements = (root: ParentNode = document): (() => void) => {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  const submitButton = root.querySelector<HTMLButtonElement>('[data-contact-submit]');

  if (!form || !submitButton) {
    return () => {};
  }

  const controls = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-contact-control]')
  );
  const errorSummary = form.querySelector<HTMLElement>('[data-contact-error-summary]');
  const status = form.querySelector<HTMLElement>('[data-contact-status]');
  const message = form.querySelector<HTMLTextAreaElement>('#contact-message');
  const messageCount = form.querySelector<HTMLElement>('[data-contact-message-count]');
  const defaultLabel = submitButton.dataset.defaultLabel ?? submitButton.textContent ?? '送信する';
  const pendingLabel = submitButton.dataset.pendingLabel ?? '送信中...';
  const invalidMessage = submitButton.dataset.invalidMessage ?? '入力内容を確認してください。';
  const turnstileMessage =
    submitButton.dataset.turnstileMessage ??
    'Turnstile の検証に失敗しました。時間をおいて再度お試しください。';

  const setSummary = (message: string) => {
    if (!errorSummary) {
      return;
    }

    errorSummary.textContent = message;
    errorSummary.hidden = !message;
  };

  const setStatus = (message: string) => {
    if (status) {
      status.textContent = message;
    }
  };

  const updateMessageCount = () => {
    if (message && messageCount) {
      messageCount.textContent = String(message.value.length);
    }
  };

  const getValidityMessage = (control: HTMLInputElement | HTMLTextAreaElement): string => {
    const label = control.dataset.contactLabel ?? control.name;

    if (control.validity.valueMissing) {
      return `${label}を入力してください`;
    }

    if (control.validity.typeMismatch && control.type === 'email') {
      return '有効なメールアドレスを入力してください';
    }

    if (control.validity.tooLong) {
      return `${label}は${control.maxLength}文字以内で入力してください`;
    }

    return '';
  };

  const updateControlState = (control: HTMLInputElement | HTMLTextAreaElement): boolean => {
    const message = getValidityMessage(control);
    const errorId = control.getAttribute('aria-errormessage');
    const errorNode = errorId ? document.getElementById(errorId) : null;

    if (message) {
      control.setAttribute('aria-invalid', 'true');
    } else {
      control.removeAttribute('aria-invalid');
    }

    if (errorNode) {
      errorNode.textContent = message;
    }

    return !message;
  };

  const validateControls = (): boolean => {
    const results = controls.map(updateControlState);
    const firstInvalid = controls.find((control) => control.hasAttribute('aria-invalid'));
    firstInvalid?.focus();
    return results.every(Boolean);
  };

  const onSubmit = (event: SubmitEvent) => {
    setSummary('');
    setStatus('');

    if (!validateControls()) {
      event.preventDefault();
      setSummary(invalidMessage);
      return;
    }

    const formData = new FormData(form);
    if (!formData.get('cf-turnstile-response')) {
      event.preventDefault();
      setSummary(turnstileMessage);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = pendingLabel;
    setStatus(pendingLabel);
  };

  const onInput = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      updateControlState(target);
      setSummary('');
      updateMessageCount();
    }
  };

  const onBlur = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      updateControlState(target);
    }
  };

  form.addEventListener('submit', onSubmit);
  form.addEventListener('input', onInput);
  form.addEventListener('blur', onBlur, true);
  updateMessageCount();
  renderTurnstile(root);

  return () => {
    form.removeEventListener('submit', onSubmit);
    form.removeEventListener('input', onInput);
    form.removeEventListener('blur', onBlur, true);
    submitButton.disabled = false;
    submitButton.textContent = defaultLabel;
  };
};

const bootContactFormEnhancements = () => {
  const windowWithState = window as WindowWithContactFormState;
  windowWithState.__contactFormCleanup?.();
  windowWithState.__contactFormCleanup = initContactFormEnhancements(document);
};

export const installContactFormEnhancements = () => {
  const windowWithState = window as WindowWithContactFormState;
  if (!windowWithState.__contactFormInstalled) {
    document.addEventListener('astro:after-swap', bootContactFormEnhancements);
    windowWithState.__contactFormInstalled = true;
  }

  bootContactFormEnhancements();
};
