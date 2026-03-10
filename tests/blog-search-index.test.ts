import { describe, expect, it } from 'vitest';
import { buildSearchIndexEntries, createSearchIndexEntry } from '../src/lib/blog/searchIndex';
import type { SearchablePost } from '../src/types';

describe('searchIndex helpers', () => {
  it('creates a stable search index entry from a personal post', () => {
    const post: SearchablePost = {
      title: 'Astro Search',
      url: '/blog/astro-search',
      publishDate: new Date('2026-03-08'),
      tags: ['Astro', 'Search'],
      source: 'personal',
      isExternal: false,
      excerpt: '検索改善メモ',
      thumbnail: '/images/search.png',
      searchText: 'astro search 検索改善メモ 本文',
    };

    expect(createSearchIndexEntry(post)).toEqual({
      id: '/blog/astro-search',
      url: '/blog/astro-search',
      source: 'personal',
      title: 'Astro Search',
      tags: ['Astro', 'Search'],
      excerpt: '検索改善メモ',
      searchText: 'astro search 検索改善メモ 本文',
    });
  });

  it('keeps external posts metadata-only in the search index payload', () => {
    const posts: SearchablePost[] = [
      {
        title: 'Astro Search',
        url: '/blog/astro-search',
        publishDate: new Date('2026-03-08'),
        tags: ['Astro'],
        source: 'personal',
        isExternal: false,
        excerpt: '本文あり',
        thumbnail: '/images/search.png',
        searchText: 'astro 本文あり 本文',
      },
      {
        title: 'Qiita Search',
        url: 'https://qiita.com/example/items/search',
        publishDate: new Date('2026-03-07'),
        tags: ['Qiita', 'JavaScript'],
        source: 'qiita',
        platform: 'Qiita',
        isExternal: true,
        searchText: 'qiita javascript',
      },
    ];

    expect(buildSearchIndexEntries(posts)).toEqual([
      {
        id: '/blog/astro-search',
        url: '/blog/astro-search',
        source: 'personal',
        title: 'Astro Search',
        tags: ['Astro'],
        excerpt: '本文あり',
        searchText: 'astro 本文あり 本文',
      },
      {
        id: 'https://qiita.com/example/items/search',
        url: 'https://qiita.com/example/items/search',
        source: 'qiita',
        title: 'Qiita Search',
        tags: ['Qiita', 'JavaScript'],
        excerpt: undefined,
        searchText: 'qiita javascript',
      },
    ]);
  });
});
