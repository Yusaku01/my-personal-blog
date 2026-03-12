import assert from 'node:assert/strict';
import test from 'node:test';
import { getParagraphUrlCandidate } from '../src/lib/remark/remarkLinkCard.ts';

test('returns a URL for a standalone autolink paragraph node', () => {
  const paragraph = {
    type: 'paragraph',
    children: [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'https://example.com' }],
      },
    ],
  };

  assert.equal(getParagraphUrlCandidate(paragraph), 'https://example.com');
});

test('ignores paragraphs with custom link text', () => {
  const paragraph = {
    type: 'paragraph',
    children: [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ type: 'text', value: 'Example' }],
      },
    ],
  };

  assert.equal(getParagraphUrlCandidate(paragraph), null);
});

test('ignores paragraphs marked to skip link cards in lists', () => {
  const paragraph = {
    type: 'paragraph',
    data: { _skipLinkCardInList: true },
    children: [{ type: 'text', value: 'https://example.com' }],
  };

  assert.equal(getParagraphUrlCandidate(paragraph), null);
});
