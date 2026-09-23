import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { formatPublishDate } from '../src/lib/blog/formatPublishDate';

describe('formatPublishDate', () => {
  it('rejects an invalid date', () => {
    expect(() => formatPublishDate(new Date(NaN))).toThrow(RangeError);
  });

  it.each([
    ['UTC', '2026/09/14', '2026年09月14日', '2025/12/27'],
    ['Asia/Tokyo', '2026/09/14', '2026年09月14日', '2025/12/28'],
    ['America/Los_Angeles', '2026/09/13', '2026年09月13日', '2025/12/27'],
  ])('uses the runtime time zone in %s', (timeZone, articleDate, japaneseDate, externalDate) => {
    const moduleUrl = pathToFileURL(resolve('src/lib/blog/formatPublishDate.ts')).href;
    const script = `
      import { formatPublishDate } from ${JSON.stringify(moduleUrl)};
      console.log(JSON.stringify([
        formatPublishDate(new Date('2026-09-14T00:00:00.000Z')),
        formatPublishDate(new Date('2026-09-14T00:00:00.000Z'), 'japanese'),
        formatPublishDate(new Date('2025-12-27T16:09:30.931Z'))
      ]));
    `;
    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', '--input-type=module', '-e', script],
      {
        encoding: 'utf8',
        env: { ...process.env, TZ: timeZone },
      }
    );

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([articleDate, japaneseDate, externalDate]);
  });
});
