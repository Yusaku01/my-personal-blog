import type { BlogSearchEntry } from './search';
import { buildBlogTabHref, matchesSearchQuery } from './search';
import { readSearchHistory, saveSearchHistory } from './searchHistory';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Pick<Response, 'ok' | 'json'>>;

type InitBlogSearchOptions = {
  root: HTMLElement;
  entries: BlogSearchEntry[];
  storage?: StorageLike;
  now?: () => number;
  location?: Location;
  history?: Pick<History, 'replaceState'>;
};

type MountBlogSearchOptions = Omit<InitBlogSearchOptions, 'entries'> & {
  fetchImpl?: FetchLike;
};

type SearchOptions = {
  persistHistory?: boolean;
  replaceUrl?: boolean;
};

type WindowWithBlogSearch = Window & {
  __blogSearchCleanup?: (() => void) | undefined;
  __blogSearchInstalled?: boolean;
  __blogSearchRequestId?: number;
};

const HIDDEN_CLASS_NAME = 'hidden';
const DEFAULT_SEARCH_INDEX_URL = '/search-index.json';

const getSearchInput = (root: HTMLElement) =>
  root.querySelector<HTMLInputElement>('[data-blog-search-input]');

const getSearchSubmitButton = (root: HTMLElement) =>
  root.querySelector<HTMLButtonElement>('[data-blog-search-form] button[type="submit"]');

const getSearchErrorElement = (root: HTMLElement) =>
  root.querySelector<HTMLElement>('[data-blog-search-error]');

const setSearchAvailability = (root: HTMLElement, disabled: boolean) => {
  const input = getSearchInput(root);
  const button = getSearchSubmitButton(root);

  if (input) {
    input.disabled = disabled;
    input.setAttribute('aria-busy', disabled ? 'true' : 'false');
  }

  if (button) {
    button.disabled = disabled;
    button.setAttribute('aria-busy', disabled ? 'true' : 'false');
  }
};

const setSearchErrorVisibility = (root: HTMLElement, visible: boolean) => {
  const errorElement = getSearchErrorElement(root);
  if (!errorElement) {
    return;
  }

  errorElement.classList.toggle(HIDDEN_CLASS_NAME, !visible);
};

const parseInitialPostCount = (root: HTMLElement): number => {
  const rawValue = Number(root.dataset.initialPostCount ?? '12');
  return Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 12;
};

const renderHistoryButtons = (container: HTMLElement, queries: string[]) => {
  container.replaceChildren();

  if (queries.length === 0) {
    container.classList.add(HIDDEN_CLASS_NAME);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const query of queries) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.blogSearchHistoryItem = query;
    button.className =
      'w-full text-left px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800';
    button.textContent = query;
    fragment.append(button);
  }

  container.append(fragment);
  container.classList.remove(HIDDEN_CLASS_NAME);
};

export const initBlogSearch = ({
  root,
  entries,
  storage = window.localStorage,
  now = Date.now,
  location = window.location,
  history = window.history,
}: InitBlogSearchOptions): (() => void) => {
  const form = root.querySelector<HTMLFormElement>('[data-blog-search-form]');
  const input = root.querySelector<HTMLInputElement>('[data-blog-search-input]');
  const historyContainer = root.querySelector<HTMLElement>('[data-blog-search-history]');
  const emptyState = root.querySelector<HTMLElement>('[data-blog-empty]');
  const loadMoreButton = root.querySelector<HTMLButtonElement>('[data-blog-load-more]');
  const loadMoreContainer = root.querySelector<HTMLElement>('[data-blog-load-more-container]');
  const wrappers = Array.from(root.querySelectorAll<HTMLElement>('[data-post-wrapper]'));
  const tabs = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-blog-tab]'));
  const entryMap = new Map(entries.map((entry) => [entry.url, entry]));
  const initialPostCount = parseInitialPostCount(root);

  if (!form || !input || !historyContainer || !emptyState) {
    return () => {};
  }

  let showAll = false;

  const selectHistoryQuery = (rawQuery: string) => {
    input.value = rawQuery;
    showAll = false;
    applySearch(rawQuery);
  };

  const updateTabLinks = (query: string) => {
    tabs.forEach((tab) => {
      const baseHref = tab.dataset.blogBaseHref ?? tab.getAttribute('href') ?? '/blog/';
      tab.href = buildBlogTabHref(baseHref, query);
    });
  };

  const hideHistory = () => {
    historyContainer.classList.add(HIDDEN_CLASS_NAME);
    historyContainer.replaceChildren();
  };

  const showHistory = () => {
    if (input.value.trim()) {
      hideHistory();
      return;
    }

    const historyEntries = readSearchHistory(storage, now).map((entry) => entry.query);
    renderHistoryButtons(historyContainer, historyEntries);
  };

  const applySearch = (
    rawQuery: string,
    { persistHistory = true, replaceUrl = true }: SearchOptions = {}
  ) => {
    const query = rawQuery.trim();

    if (persistHistory && query) {
      saveSearchHistory(storage, query, now);
    }

    if (replaceUrl) {
      history.replaceState({}, '', buildBlogTabHref(location.pathname || '/blog/', query));
    }

    updateTabLinks(query);
    hideHistory();

    let matchedCount = 0;

    wrappers.forEach((wrapper, index) => {
      const url = wrapper.dataset.postUrl ?? '';
      const entry = entryMap.get(url);
      const isMatch = entry ? matchesSearchQuery(entry.searchText, query) : query.length === 0;

      if (!isMatch) {
        wrapper.classList.add(HIDDEN_CLASS_NAME);
        return;
      }

      matchedCount += 1;
      const shouldHideForPagination = !query && !showAll && index >= initialPostCount;
      wrapper.classList.toggle(HIDDEN_CLASS_NAME, shouldHideForPagination);
    });

    emptyState.classList.toggle(HIDDEN_CLASS_NAME, matchedCount > 0);

    if (loadMoreContainer) {
      const shouldHideLoadMore =
        Boolean(query) || showAll || matchedCount <= initialPostCount || !loadMoreButton;
      loadMoreContainer.classList.toggle(HIDDEN_CLASS_NAME, shouldHideLoadMore);
    }
  };

  const onSubmit = (event: Event) => {
    event.preventDefault();
    showAll = false;
    applySearch(input.value);
  };

  const onInput = () => {
    if (input.value.trim()) {
      hideHistory();
      return;
    }

    if (document.activeElement === input) {
      showHistory();
    }
  };

  const onFocus = () => {
    showHistory();
  };

  const onFocusOut = () => {
    queueMicrotask(() => {
      if (!root.contains(document.activeElement)) {
        hideHistory();
      }
    });
  };

  const onHistoryClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const query = target.dataset.blogSearchHistoryItem;
    if (!query) {
      return;
    }

    selectHistoryQuery(query);
  };

  const onHistoryPointerDown = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    const query = target.dataset.blogSearchHistoryItem;
    if (!query) {
      return;
    }

    event.preventDefault();
    selectHistoryQuery(query);
  };

  const onLoadMore = () => {
    showAll = true;
    applySearch(input.value, { persistHistory: false });
  };

  form.addEventListener('submit', onSubmit);
  input.addEventListener('input', onInput);
  input.addEventListener('focus', onFocus);
  root.addEventListener('focusout', onFocusOut);
  historyContainer.addEventListener('pointerdown', onHistoryPointerDown);
  historyContainer.addEventListener('click', onHistoryClick);
  loadMoreButton?.addEventListener('click', onLoadMore);

  const initialQuery = root.dataset.initialQuery ?? '';
  input.value = initialQuery;
  applySearch(initialQuery, { persistHistory: false, replaceUrl: false });

  return () => {
    form.removeEventListener('submit', onSubmit);
    input.removeEventListener('input', onInput);
    input.removeEventListener('focus', onFocus);
    root.removeEventListener('focusout', onFocusOut);
    historyContainer.removeEventListener('pointerdown', onHistoryPointerDown);
    historyContainer.removeEventListener('click', onHistoryClick);
    loadMoreButton?.removeEventListener('click', onLoadMore);
  };
};

const isBlogSearchEntry = (value: unknown): value is BlogSearchEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<BlogSearchEntry>;
  return (
    typeof candidate.url === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.searchText === 'string'
  );
};

export const loadBlogSearchEntries = async (
  fetchImpl: FetchLike = window.fetch.bind(window),
  searchIndexUrl = DEFAULT_SEARCH_INDEX_URL
): Promise<BlogSearchEntry[]> => {
  const response = await fetchImpl(searchIndexUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load blog search index: ${searchIndexUrl}`);
  }

  const parsed = await response.json();
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid blog search index payload');
  }

  return parsed.filter(isBlogSearchEntry);
};

export const mountBlogSearch = async ({
  root,
  fetchImpl = window.fetch.bind(window),
  storage,
  now,
  location,
  history,
}: MountBlogSearchOptions): Promise<() => void> => {
  setSearchAvailability(root, true);
  setSearchErrorVisibility(root, false);

  try {
    const searchIndexUrl = root.dataset.searchIndexUrl ?? DEFAULT_SEARCH_INDEX_URL;
    const entries = await loadBlogSearchEntries(fetchImpl, searchIndexUrl);
    setSearchAvailability(root, false);
    return initBlogSearch({
      root,
      entries,
      storage,
      now,
      location,
      history,
    });
  } catch {
    setSearchAvailability(root, true);
    setSearchErrorVisibility(root, true);
    return () => {};
  }
};

const bootBlogSearch = async () => {
  const windowWithState = window as WindowWithBlogSearch;
  windowWithState.__blogSearchCleanup?.();
  windowWithState.__blogSearchCleanup = undefined;

  const root = document.querySelector<HTMLElement>('[data-blog-search-root]');

  if (!root) {
    return;
  }

  const requestId = (windowWithState.__blogSearchRequestId ?? 0) + 1;
  windowWithState.__blogSearchRequestId = requestId;

  const cleanup = await mountBlogSearch({
    root,
  });

  if (windowWithState.__blogSearchRequestId !== requestId) {
    cleanup();
    return;
  }

  windowWithState.__blogSearchCleanup = cleanup;
};

export const installBlogSearch = () => {
  const windowWithState = window as WindowWithBlogSearch;
  if (!windowWithState.__blogSearchInstalled) {
    document.addEventListener('astro:after-swap', bootBlogSearch);
    windowWithState.__blogSearchInstalled = true;
  }

  bootBlogSearch();
};
