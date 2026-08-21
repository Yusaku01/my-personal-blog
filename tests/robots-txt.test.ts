import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const robotsTxt = readFileSync(join(process.cwd(), 'public/robots.txt'), 'utf8');

describe('robots.txt', () => {
  it('declares RFC 9309 user-agent groups with allow and disallow rules', () => {
    expect(robotsTxt).toMatch(/^User-agent:\s+\*\n/i);
    expect(robotsTxt).toMatch(/^Allow:\s+\/$/im);
    expect(robotsTxt).toMatch(/^Disallow:\s+\S+/im);
  });

  it('points crawlers at the absolute sitemap index URL', () => {
    expect(robotsTxt).toMatch(/^Sitemap:\s+https:\/\/saku-space\.com\/sitemap-index\.xml$/m);
    expect(robotsTxt.endsWith('\n')).toBe(true);
  });
});
