type MermaidModule = typeof import('mermaid');

let mermaidModule: MermaidModule | undefined;
let isMermaidPageLoadBound = false;

const getMermaidTheme = () =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'default';

const renderMermaidDiagrams = async () => {
  const diagrams = Array.from(
    document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-processed="true"])')
  );

  if (diagrams.length === 0) {
    return;
  }

  mermaidModule ??= await import('mermaid');
  const mermaid = mermaidModule.default;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: getMermaidTheme(),
  });

  await mermaid.run({ nodes: diagrams });
};

export const bindMermaidDiagrams = () => {
  void renderMermaidDiagrams();

  if (isMermaidPageLoadBound) {
    return;
  }

  document.addEventListener('astro:page-load', () => {
    void renderMermaidDiagrams();
  });
  isMermaidPageLoadBound = true;
};
