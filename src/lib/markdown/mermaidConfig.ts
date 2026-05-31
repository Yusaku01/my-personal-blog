import rehypeMermaid from 'rehype-mermaid';
import externalLinkIcon from '../rehype/externalLinkIcon.ts';
import footnoteBackrefIcon from '../rehype/footnoteBackrefIcon.ts';

export const markdownSyntaxHighlight = {
  type: 'shiki',
  excludeLangs: ['mermaid', 'math'],
} as const;

export const sharedRehypePlugins = [
  [externalLinkIcon, { site: 'https://saku-space.com' }],
  footnoteBackrefIcon,
];

export const shouldRenderMermaidOnClient = (): boolean =>
  process.env.WORKERS_CI === '1' || process.env.ASTRO_MERMAID_STRATEGY === 'pre-mermaid';

const mermaidRehypeOptions = shouldRenderMermaidOnClient()
  ? {
      strategy: 'pre-mermaid',
      prefix: 'mermaid-diagram',
    }
  : {
      strategy: 'img-svg',
      dark: true,
      prefix: 'mermaid-diagram',
    };

export const mermaidRehypePlugin = [rehypeMermaid, mermaidRehypeOptions] as const;

export const markdownRehypePlugins = [...sharedRehypePlugins, mermaidRehypePlugin];
