import assert from 'node:assert/strict';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import disableLinkCardInList from '../src/lib/remark/disableLinkCardInList.ts';

const URL_ONLY_PATTERN = /^(https?:\/\/|www(?=\.))([-.\w]+)([^\s]*)$/i;

const mockLinkCard = () => {
  return (tree) => {
    visit(tree, 'paragraph', (node, index, parent) => {
      if (!parent || typeof index !== 'number' || !Array.isArray(parent.children)) {
        return;
      }

      if (node.children.length !== 1 || node.data !== undefined) {
        return;
      }

      const [child] = node.children;
      if (child.type !== 'text' || typeof child.value !== 'string') {
        return;
      }

      const url = child.value.trim();
      if (!URL_ONLY_PATTERN.test(url)) {
        return;
      }

      parent.children.splice(index, 1, {
        type: 'html',
        value: `<a class="rlc-container" href="${url}">${url}</a>`,
      });
    });
  };
};

const render = async (markdown) => {
  const file = await unified()
    .use(remarkParse)
    .use(disableLinkCardInList)
    .use(mockLinkCard)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
};

test('list item bare URL is not converted but root bare URL is converted', async () => {
  const html = await render('- https://example.com\n\nhttps://example.com\n');
  const cardCount = (html.match(/class="rlc-container"/g) ?? []).length;

  assert.equal(cardCount, 1);
  assert.match(html, /<li>https:\/\/example\.com<\/li>/);
  assert.match(
    html,
    /<a class="rlc-container" href="https:\/\/example\.com">https:\/\/example\.com<\/a>/
  );
});
