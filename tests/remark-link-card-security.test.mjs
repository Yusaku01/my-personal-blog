import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';

import { JSDOM } from 'jsdom';

import remarkLinkCard from '../src/lib/remark/remarkLinkCard.ts';

const startServer = async (handler) => {
  const server = http.createServer(handler);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });

  return server;
};

const closeServer = async (server) => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

test('escapes Open Graph image URLs before inserting link-card HTML attributes', async () => {
  const server = await startServer((_, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`
      <!doctype html>
      <html>
        <head>
          <meta property="og:title" content="AT&amp;T &lt;Title&gt;">
          <meta property="og:image" content="https://cdn.example.test/card.jpg&quot; onerror=&quot;alert(1)">
        </head>
      </html>
    `);
  });

  try {
    const address = server.address();
    assert(address && typeof address === 'object');

    const targetUrl = `http://127.0.0.1:${address.port}/article`;
    const tree = {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: targetUrl }],
        },
      ],
    };

    await remarkLinkCard({ shortenUrl: true })(tree);

    const html = tree.children[0].value;
    const fragment = JSDOM.fragment(html);
    const image = fragment.querySelector('.rlc-image');
    const title = fragment.querySelector('.rlc-title');

    assert(image);
    assert(title);
    assert.equal(title.textContent, 'AT&T <Title>');
    assert.equal(image.getAttribute('onerror'), null);
    assert.match(image.getAttribute('src'), /^https:\/\/cdn\.example\.test\/card\.jpg"/);
    assert.doesNotMatch(html, /src="https:\/\/cdn\.example\.test\/card\.jpg" onerror=/);
  } finally {
    await closeServer(server);
  }
});
