import type { Element, Root } from 'hast';
import { describe, expect, it } from 'vitest';
import externalLinkIcon from '../src/lib/rehype/externalLinkIcon';

const transformLink = (href: string): Element => {
  const link: Element = {
    type: 'element',
    tagName: 'a',
    properties: { href },
    children: [{ type: 'text', value: 'link' }],
  };
  const tree: Root = { type: 'root', children: [link] };

  externalLinkIcon({ site: 'https://saku-space.com' })(tree);

  return link;
};

describe('externalLinkIcon', () => {
  it.each([
    'javascript:alert(1)',
    'data:text/html,hello',
    'vbscript:msgbox(1)',
    'mailto:a@example.com',
    'tel:0123456789',
  ])('does not decorate the non-HTTP URL %s', (href) => {
    expect(transformLink(href).children).toHaveLength(1);
  });

  it('decorates an external HTTPS URL', () => {
    expect(transformLink('https://example.com').children).toHaveLength(2);
  });
});
