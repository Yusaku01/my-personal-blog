import assert from 'node:assert/strict';
import test from 'node:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import codeFenceFilename from '../src/lib/remark/codeFenceFilename.ts';

const transformMarkdown = async (markdown) => {
  const processor = unified().use(remarkParse).use(codeFenceFilename);
  const tree = processor.parse(markdown);
  return processor.run(tree);
};

const findCodeNodes = (tree) => {
  return (tree.children ?? []).filter((node) => node.type === 'code');
};

test('keeps plain language fences unchanged', async () => {
  const tree = await transformMarkdown('```js\nconst enabled = true;\n```');
  const [codeNode] = findCodeNodes(tree);

  assert.equal(codeNode.lang, 'js');
  assert.equal(codeNode.meta, null);
});

test('converts filename fences to inferred language and injects filename meta', async () => {
  const tree = await transformMarkdown('```astro.config.mjs\nconst enabled = true;\n```');
  const [codeNode] = findCodeNodes(tree);

  assert.equal(codeNode.lang, 'mjs');
  assert.equal(codeNode.meta, 'filename="astro.config.mjs"');
});

test('preserves existing meta while appending filename for filename fences', async () => {
  const tree = await transformMarkdown(
    '```src/scripts/code-copy.ts {2}\nconst enabled = true;\n```'
  );
  const [codeNode] = findCodeNodes(tree);

  assert.equal(codeNode.lang, 'ts');
  assert.match(codeNode.meta, /\{2\}/);
  assert.match(codeNode.meta, /filename="src\/scripts\/code-copy\.ts"/);
});

test('does not override explicit title metadata', async () => {
  const tree = await transformMarkdown(
    '```astro.config.mjs title="Config file"\nconst enabled = true;\n```'
  );
  const [codeNode] = findCodeNodes(tree);

  assert.equal(codeNode.lang, 'mjs');
  assert.equal(codeNode.meta, 'title="Config file"');
});
