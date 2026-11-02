import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';

import remarkLinkCard from '../src/lib/remark/remarkLinkCard.ts';

const createTree = (url) => ({
  type: 'root',
  children: [{ type: 'paragraph', children: [{ type: 'text', value: url }] }],
});

const withServer = async (handler, run) => {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  try {
    const address = server.address();
    assert(address && typeof address === 'object');
    await run(`http://127.0.0.1:${address.port}/article`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

test('shares concurrent metadata requests across documents but refreshes later renders', async () => {
  let requests = 0;
  await withServer(
    (_, response) => {
      requests++;
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(
        `<html><head><meta property="og:title" content="Title ${requests}"></head></html>`
      );
    },
    async (url) => {
      const first = createTree(url);
      const second = createTree(url);
      await Promise.all([remarkLinkCard()(first), remarkLinkCard()(second)]);

      assert.equal(requests, 1);
      assert.match(first.children[0].value, /Title 1/);
      assert.equal(first.children[0].value, second.children[0].value);

      const later = createTree(url);
      await remarkLinkCard()(later);
      assert.equal(requests, 2);
      assert.match(later.children[0].value, /Title 2/);
    }
  );
});

test('does not retain failed metadata requests', async () => {
  let requests = 0;
  await withServer(
    (_, response) => {
      requests++;
      response.writeHead(requests === 1 ? 404 : 200, { 'Content-Type': 'text/html' });
      response.end('<html><head><meta property="og:title" content="Recovered"></head></html>');
    },
    async (url) => {
      const first = createTree(url);
      await remarkLinkCard()(first);
      assert.doesNotMatch(first.children[0].value, /Recovered/);

      const retry = createTree(url);
      await remarkLinkCard()(retry);
      assert.equal(requests, 2);
      assert.match(retry.children[0].value, /Recovered/);
    }
  );
});
