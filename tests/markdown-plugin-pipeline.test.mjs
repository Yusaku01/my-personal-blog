import assert from 'node:assert/strict';
import test from 'node:test';

import disableLinkCardInList from '../src/lib/remark/disableLinkCardInList.ts';
import remarkLinkCard from '../src/lib/remark/remarkLinkCard.ts';
import { sharedRemarkPlugins } from '../src/lib/markdown/pluginPipelines.ts';

test('shared remark plugins keep link-card guard before the transformer', () => {
  const disableIndex = sharedRemarkPlugins.findIndex((plugin) => plugin === disableLinkCardInList);
  const linkCardIndex = sharedRemarkPlugins.findIndex((plugin) => {
    if (Array.isArray(plugin)) {
      return plugin[0] === remarkLinkCard;
    }

    return plugin === remarkLinkCard;
  });

  assert.notEqual(disableIndex, -1);
  assert.notEqual(linkCardIndex, -1);
  assert.ok(disableIndex < linkCardIndex);
});
