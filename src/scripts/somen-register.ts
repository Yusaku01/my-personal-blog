let isPageLoadBound = false;

const registerSomenIfNeeded = () => {
  if (document.querySelector('flow-diagram')) {
    void import('somenflow/register');
  }
};

export const bindSomenRegistration = () => {
  registerSomenIfNeeded();

  if (isPageLoadBound) {
    return;
  }

  document.addEventListener('astro:page-load', registerSomenIfNeeded);
  isPageLoadBound = true;
};
