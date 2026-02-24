import assert from 'node:assert/strict';
import test from 'node:test';
import { unified } from 'unified';
import remarkDirective from 'remark-directive';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkAdmonition from '../src/lib/remark/admonition.ts';

const normalizeHtml = (value) => value.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();

const render = async (markdown) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkAdmonition)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
};

test('renders default labels for all supported admonition variants', async () => {
  const cases = [
    ['note', 'Note'],
    ['caution', 'Caution'],
    ['danger', 'Danger'],
  ];

  for (const [variant, label] of cases) {
    const html = await render(`:::${variant}\ncontent\n:::\n`);
    assert.match(html, new RegExp(`class="admonition admonition--${variant}"`));
    assert.match(html, new RegExp(`aria-label="${label}"`));
    assert.match(html, new RegExp(`<p class="admonition__title">${label}</p>`));
  }
});

test('uses a custom label when provided', async () => {
  const html = await render(':::note[Did you know?]\nTry...\n:::\n');
  assert.match(html, /aria-label="Did you know\?"/);
  assert.match(html, /<p class="admonition__title">Did you know\?<\/p>/);
});

test('falls back to the default label when title is empty', async () => {
  const html = await render(':::note[]\nTry...\n:::\n');
  assert.match(html, /class="admonition admonition--note"/);
  assert.match(html, /aria-label="Note"/);
  assert.match(html, /<p class="admonition__title">Note<\/p>/);
});

test('keeps unknown variants as regular body content', async () => {
  const html = await render(':::unknown\nPlain text\n:::\n');
  assert.doesNotMatch(html, /class="admonition/);
  assert.match(html, /<p>Plain text<\/p>/);
});

test('keeps tip as regular body content', async () => {
  const html = await render(':::tip\nPlain text\n:::\n');
  assert.doesNotMatch(html, /class="admonition/);
  assert.match(html, /<p>Plain text<\/p>/);
});

test('preserves complex children and links inside admonition content', async () => {
  const html = await render(':::note[]\nTry...\n[link](https://example.com)\n:::\n');
  assert.match(html, /class="admonition admonition--note"/);
  assert.match(html, /<div class="admonition__content">/);
  assert.match(html, /<a href="https:\/\/example\.com">link<\/a>/);
});

test('snapshot: admonition html structure is stable', async () => {
  const html = await render(':::note[]\nTry...\n[link](https://example.com)\n:::\n');
  assert.equal(
    normalizeHtml(html),
    normalizeHtml(
      '<aside class="admonition admonition--note" aria-label="Note"><p class="admonition__title">Note</p><div class="admonition__content"><p>Try... <a href="https://example.com">link</a></p></div></aside>'
    )
  );
});
