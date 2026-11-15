import remarkDirective from 'remark-directive';

import remarkAdmonition from '../remark/admonition.ts';
import codeFenceFilename from '../remark/codeFenceFilename.ts';
import disableLinkCardInList from '../remark/disableLinkCardInList.ts';
import remarkLinkCard from '../remark/remarkLinkCard.ts';
import externalLinkIcon from '../rehype/externalLinkIcon.ts';
import footnoteBackrefIcon from '../rehype/footnoteBackrefIcon.ts';

export const sharedRemarkPlugins = [
  remarkDirective,
  remarkAdmonition,
  disableLinkCardInList,
  codeFenceFilename,
  [remarkLinkCard, { shortenUrl: true }],
];

export const markdownSyntaxHighlight = {
  type: 'shiki',
  excludeLangs: ['math'],
} as const;

export const markdownRehypePlugins = [
  [externalLinkIcon, { site: 'https://saku-space.com' }],
  footnoteBackrefIcon,
];
