import remarkDirective from 'remark-directive';

import remarkAdmonition from '../remark/admonition.ts';
import codeFenceFilename from '../remark/codeFenceFilename.ts';
import disableLinkCardInList from '../remark/disableLinkCardInList.ts';
import remarkLinkCard from '../remark/remarkLinkCard.ts';
import { markdownRehypePlugins, markdownSyntaxHighlight } from './mermaidConfig.ts';

export const sharedRemarkPlugins = [
  remarkDirective,
  remarkAdmonition,
  disableLinkCardInList,
  codeFenceFilename,
  [remarkLinkCard, { shortenUrl: true }],
];

export { markdownRehypePlugins, markdownSyntaxHighlight };
