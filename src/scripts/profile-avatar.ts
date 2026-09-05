type ProfileAvatarElements = {
  root: HTMLElement;
  image: HTMLImageElement;
  toggle: HTMLButtonElement;
};

const getProfileAvatarElements = (root: HTMLElement): ProfileAvatarElements | null => {
  const image = root.querySelector<HTMLImageElement>('[data-profile-avatar-image]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-profile-avatar-toggle]');

  if (!image || !toggle) {
    return null;
  }

  return {
    root,
    image,
    toggle,
  };
};

export const setupProfileAvatars = (scope: ParentNode = document): (() => void) => {
  const avatars = Array.from(scope.querySelectorAll<HTMLElement>('[data-profile-avatar]'))
    .map(getProfileAvatarElements)
    .filter((avatar): avatar is ProfileAvatarElements => avatar !== null);

  if (avatars.length === 0) {
    return () => {};
  }

  const controller = new AbortController();
  const { signal } = controller;

  for (const { root, image, toggle } of avatars) {
    const photoSrc = root.dataset.profileAvatarPhotoSrc;
    if (!photoSrc) {
      toggle.disabled = true;
      continue;
    }

    const original = {
      alt: image.getAttribute('alt') ?? '',
      src: image.getAttribute('src'),
    };
    let isPhotoVisible = false;

    const updateState = (showPhoto: boolean) => {
      isPhotoVisible = showPhoto;

      if (showPhoto) {
        image.setAttribute('src', photoSrc);
        image.setAttribute('alt', root.dataset.profileAvatarPhotoAlt ?? original.alt);
      } else {
        if (original.src) {
          image.setAttribute('src', original.src);
        }
        image.setAttribute('alt', original.alt);
      }

      const nextLabel = showPhoto
        ? (root.dataset.profileAvatarShowIllustrationLabel ?? '')
        : (root.dataset.profileAvatarShowPhotoLabel ?? '');
      toggle.setAttribute('aria-pressed', String(showPhoto));
      toggle.setAttribute('aria-label', nextLabel);
      toggle.textContent = nextLabel;
    };

    updateState(false);
    toggle.addEventListener('click', () => updateState(!isPhotoVisible), { signal });
  }

  return () => controller.abort();
};

let cleanupProfileAvatars: (() => void) | null = null;
let isPageLoadBound = false;

const setup = () => {
  cleanupProfileAvatars?.();
  cleanupProfileAvatars = setupProfileAvatars();
};

export const bindProfileAvatars = () => {
  setup();

  if (isPageLoadBound) {
    return;
  }

  isPageLoadBound = true;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  }
  document.addEventListener('astro:page-load', setup);
  document.addEventListener('astro:after-swap', setup);
};
