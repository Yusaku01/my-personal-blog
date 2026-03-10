import { beforeEach, describe, expect, it } from 'vitest';
import {
  BLOG_SEARCH_HISTORY_KEY,
  createMemoryStorage,
  readSearchHistory,
  saveSearchHistory,
} from '../src/lib/blog/searchHistory';

describe('search history', () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('keeps only the newest 5 items', () => {
    for (let index = 1; index <= 6; index += 1) {
      saveSearchHistory(storage, `query-${index}`, () => index);
    }

    expect(readSearchHistory(storage, () => 999).map((entry) => entry.query)).toEqual([
      'query-6',
      'query-5',
      'query-4',
      'query-3',
      'query-2',
    ]);
  });

  it('deduplicates and promotes the latest search', () => {
    saveSearchHistory(storage, 'astro', () => 1);
    saveSearchHistory(storage, 'zenn', () => 2);
    saveSearchHistory(storage, 'astro', () => 3);

    expect(readSearchHistory(storage, () => 999)).toEqual([
      { query: 'astro', searchedAt: 3 },
      { query: 'zenn', searchedAt: 2 },
    ]);
  });

  it('drops entries older than 30 days', () => {
    const now = Date.UTC(2026, 2, 8);
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    storage.setItem(
      BLOG_SEARCH_HISTORY_KEY,
      JSON.stringify([
        { query: 'recent', searchedAt: now - thirtyDays + 1 },
        { query: 'expired', searchedAt: now - thirtyDays - 1 },
      ])
    );

    expect(readSearchHistory(storage, () => now)).toEqual([
      { query: 'recent', searchedAt: now - thirtyDays + 1 },
    ]);
  });
});
