type WindowWithContactFormState = Window & {
  __contactFormCleanup?: (() => void) | undefined;
  __contactFormInstalled?: boolean;
};

export const initContactFormEnhancements = (root: ParentNode = document): (() => void) => {
  const form = root.querySelector<HTMLFormElement>('[data-contact-form]');
  const submitButton = root.querySelector<HTMLButtonElement>('[data-contact-submit]');

  if (!form || !submitButton) {
    return () => {};
  }

  const defaultLabel = submitButton.dataset.defaultLabel ?? submitButton.textContent ?? '送信する';
  const pendingLabel = submitButton.dataset.pendingLabel ?? '送信中...';

  const onSubmit = () => {
    submitButton.disabled = true;
    submitButton.textContent = pendingLabel;
  };

  form.addEventListener('submit', onSubmit);

  return () => {
    form.removeEventListener('submit', onSubmit);
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
