export const BLOG_SEARCH_HISTORY_KEY = 'blog-search-history';

export type BlogSearchHistoryEntry = {
  query: string;
  searchedAt: number;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const HISTORY_LIMIT = 5;
const HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

const isHistoryEntry = (value: unknown): value is BlogSearchHistoryEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const maybeEntry = value as Partial<BlogSearchHistoryEntry>;
  return typeof maybeEntry.query === 'string' && typeof maybeEntry.searchedAt === 'number';
};

const normalizeHistoryQuery = (query: string): string => query.trim();

const pruneHistory = (entries: BlogSearchHistoryEntry[], now: number): BlogSearchHistoryEntry[] => {
  return entries
    .filter((entry) => entry.searchedAt >= now - HISTORY_TTL_MS)
    .filter((entry) => normalizeHistoryQuery(entry.query).length > 0)
    .sort((left, right) => right.searchedAt - left.searchedAt)
    .slice(0, HISTORY_LIMIT);
};

const parseHistory = (rawValue: string | null, now: number): BlogSearchHistoryEntry[] => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return pruneHistory(parsed.filter(isHistoryEntry), now);
  } catch {
    return [];
  }
};

export const readSearchHistory = (
  storage: StorageLike,
  now: () => number = Date.now
): BlogSearchHistoryEntry[] => {
  const entries = parseHistory(storage.getItem(BLOG_SEARCH_HISTORY_KEY), now());
  storage.setItem(BLOG_SEARCH_HISTORY_KEY, JSON.stringify(entries));
  return entries;
};

export const saveSearchHistory = (
  storage: StorageLike,
  query: string,
  now: () => number = Date.now
): BlogSearchHistoryEntry[] => {
  const normalizedQuery = normalizeHistoryQuery(query);
  if (!normalizedQuery) {
    return readSearchHistory(storage, now);
  }

  const currentTime = now();
  const existingEntries = parseHistory(storage.getItem(BLOG_SEARCH_HISTORY_KEY), currentTime);
  const nextEntries = pruneHistory(
    [
      { query: normalizedQuery, searchedAt: currentTime },
      ...existingEntries.filter((entry) => entry.query !== normalizedQuery),
    ],
    currentTime
  );

  storage.setItem(BLOG_SEARCH_HISTORY_KEY, JSON.stringify(nextEntries));
  return nextEntries;
};

export const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? (store.get(key) ?? null) : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
};
