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

export const mermaidRehypePlugin = [
  rehypeMermaid,
  {
    strategy: 'img-svg',
    dark: true,
    prefix: 'mermaid-diagram',
  },
] as const;

export const markdownRehypePlugins = [...sharedRehypePlugins, mermaidRehypePlugin];
