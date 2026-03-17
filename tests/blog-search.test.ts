import { describe, expect, it } from 'vitest';
import {
  buildBlogTabHref,
  buildBlogSearchText,
  getInitialBlogSearchState,
  matchesSearchQuery,
  normalizeSearchText,
} from '../src/lib/blog/search';

describe('normalizeSearchText', () => {
  it('normalizes width, case, and whitespace', () => {
    expect(normalizeSearchText('　Astro　ＡＢＣ  TEST \n Search\t')).toBe('astro abc test search');
  });

  it('strips markup noise and excludes fenced code blocks', () => {
    const normalized = normalizeSearchText(`
## Heading

本文 <strong>HTML</strong> [Link](https://example.com)

\`\`\`ts
const secretKeyword = 'skip-me';
\`\`\`
`);

    expect(normalized).toContain('heading');
    expect(normalized).toContain('本文');
    expect(normalized).toContain('html');
    expect(normalized).toContain('link');
    expect(normalized).not.toContain('skip-me');
    expect(normalized).not.toContain('secretkeyword');
  });
});

describe('buildBlogSearchText', () => {
  it('includes body text for personal posts', () => {
    const searchText = buildBlogSearchText({
      source: 'personal',
      title: 'Astro Search',
      tags: ['Astro'],
      excerpt: '概要',
      body: '本文にしかないキーワード',
    });

    expect(searchText).toContain('astro search');
    expect(searchText).toContain('概要');
    expect(searchText).toContain('本文にしかないキーワード');
  });

  it('ignores body and excerpt for external posts', () => {
    const searchText = buildBlogSearchText({
      source: 'qiita',
      title: 'Qiita tips',
      tags: ['JavaScript'],
      excerpt: 'metadata には含めない',
      body: 'external body keyword',
    });

    expect(searchText).toContain('qiita tips');
    expect(searchText).toContain('javascript');
    expect(searchText).not.toContain('external body keyword');
    expect(searchText).not.toContain('metadata には含めない');
  });
});

describe('matchesSearchQuery', () => {
  it('matches personal body keywords only', () => {
    const personalSearchText = buildBlogSearchText({
      source: 'personal',
      title: 'Astro Search',
      tags: ['Astro'],
      body: '本文ワード',
    });
    const externalSearchText = buildBlogSearchText({
      source: 'zenn',
      title: 'Zenn Search',
      tags: ['Astro'],
      body: '本文ワード',
    });

    expect(matchesSearchQuery(personalSearchText, '本文ワード')).toBe(true);
    expect(matchesSearchQuery(externalSearchText, '本文ワード')).toBe(false);
  });
});

describe('buildBlogTabHref', () => {
  it('appends q when query is present', () => {
    expect(buildBlogTabHref('/blog/personal/', 'Astro Search')).toBe(
      '/blog/personal/?q=Astro+Search'
    );
  });

  it('keeps clean href when query is empty', () => {
    expect(buildBlogTabHref('/blog/', '')).toBe('/blog/');
  });
});

describe('getInitialBlogSearchState', () => {
  const records = [
    { searchText: 'astro island 本文あり' },
    { searchText: 'プリフェッチ 比較メモ' },
    { searchText: 'astro prefetch' },
  ];

  it('keeps pagination-only visibility when there is no active query', () => {
    expect(getInitialBlogSearchState(records, '', 2)).toEqual({
      activeQuery: '',
      hasActiveQuery: false,
      matchedCount: 3,
      shouldShowLoadMore: true,
      hiddenStates: [false, false, true],
    });
  });

  it('shows only matched posts when the page loads with a query', () => {
    expect(getInitialBlogSearchState(records, 'プリフェッチ', 2)).toEqual({
      activeQuery: 'プリフェッチ',
      hasActiveQuery: true,
      matchedCount: 1,
      shouldShowLoadMore: false,
      hiddenStates: [true, false, true],
    });
  });

  it('trims the query and keeps all matching posts visible', () => {
    expect(getInitialBlogSearchState(records, '  prefetch  ', 1)).toEqual({
      activeQuery: 'prefetch',
      hasActiveQuery: true,
      matchedCount: 1,
      shouldShowLoadMore: false,
      hiddenStates: [true, true, false],
    });
  });
});
