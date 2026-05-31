type MermaidModule = typeof import('mermaid');

let mermaidModule: MermaidModule | undefined;

const getMermaidTheme = () =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'default';

export const bindMermaidDiagrams = async () => {
  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('pre.mermaid'));

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
