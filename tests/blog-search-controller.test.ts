import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlogSearchEntry } from '../src/lib/blog/search';
import { initBlogSearch, mountBlogSearch } from '../src/lib/blog/searchController';
import { createMemoryStorage } from '../src/lib/blog/searchHistory';

const entries: BlogSearchEntry[] = [
  {
    url: '/blog/personal/astro-search',
    source: 'personal',
    searchText: 'astro search 本文ワード',
  },
  {
    url: '/blog/qiita/astro-search',
    source: 'qiita',
    searchText: 'astro qiita javascript',
  },
];

const renderDom = () => {
  document.body.innerHTML = `
    <div
      data-blog-search-root
      data-initial-post-count="12"
      data-initial-query=""
      data-search-index-url="/search-index.json"
    >
      <form data-blog-search-form>
        <input data-blog-search-input type="search" />
        <button type="submit">検索する</button>
      </form>
      <div data-blog-search-history class="hidden"></div>
      <p data-blog-search-error class="hidden"></p>
      <div data-blog-empty class="hidden"></div>
      <div data-blog-post-grid>
        <div data-post-wrapper data-post-url="/blog/personal/astro-search"></div>
        <div data-post-wrapper data-post-url="/blog/qiita/astro-search"></div>
      </div>
      <a data-blog-tab data-blog-base-href="/blog/" href="/blog/">全て</a>
      <a data-blog-tab data-blog-base-href="/blog/personal/" href="/blog/personal/">個人ブログ</a>
      <div data-blog-load-more-container class="hidden">
        <button data-blog-load-more type="button">過去の記事を見る</button>
      </div>
    </div>
    <button data-outside-button type="button">outside</button>
  `;
};

describe('initBlogSearch', () => {
  beforeEach(() => {
    renderDom();
    window.history.replaceState({}, '', 'https://example.com/blog/');
  });

  it('does not filter on input events', () => {
    const storage = createMemoryStorage();
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-post-wrapper]'));

    const cleanup = initBlogSearch({ root, entries, storage });
    input.value = '本文ワード';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(wrappers.every((wrapper) => !wrapper.classList.contains('hidden'))).toBe(true);
    cleanup();
  });

  it('filters and syncs the query on submit', () => {
    const storage = createMemoryStorage();
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const form = document.querySelector('[data-blog-search-form]') as HTMLFormElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-post-wrapper]'));
    const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-blog-tab]'));

    const cleanup = initBlogSearch({ root, entries, storage });
    input.value = '本文ワード';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(wrappers[0]?.classList.contains('hidden')).toBe(false);
    expect(wrappers[1]?.classList.contains('hidden')).toBe(true);
    expect(window.location.search).toBe('?q=%E6%9C%AC%E6%96%87%E3%83%AF%E3%83%BC%E3%83%89');
    expect(tabs[0]?.href).toContain('/blog/?q=');
    cleanup();
  });

  it('shows history suggestions on focus for empty input and re-searches on history pointer selection', () => {
    const storage = createMemoryStorage();
    const now = vi.fn(() => Date.UTC(2026, 2, 8));
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const form = document.querySelector('[data-blog-search-form]') as HTMLFormElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const history = document.querySelector('[data-blog-search-history]') as HTMLElement;
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-post-wrapper]'));

    const cleanup = initBlogSearch({ root, entries, storage, now });
    input.value = '本文ワード';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    input.value = '';
    input.dispatchEvent(new Event('focus', { bubbles: true }));

    const button = history.querySelector<HTMLButtonElement>('button');
    expect(history.classList.contains('hidden')).toBe(false);
    expect(button?.textContent).toContain('本文ワード');

    button?.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));

    expect(input.value).toBe('本文ワード');
    expect(wrappers[0]?.classList.contains('hidden')).toBe(false);
    expect(wrappers[1]?.classList.contains('hidden')).toBe(true);
    expect(window.location.search).toBe('?q=%E6%9C%AC%E6%96%87%E3%83%AF%E3%83%BC%E3%83%89');
    expect(history.classList.contains('hidden')).toBe(true);
    cleanup();
  });

  it('hides history when focus leaves the search area', async () => {
    const storage = createMemoryStorage();
    const now = vi.fn(() => Date.UTC(2026, 2, 8));
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const form = document.querySelector('[data-blog-search-form]') as HTMLFormElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const history = document.querySelector('[data-blog-search-history]') as HTMLElement;
    const outsideButton = document.querySelector('[data-outside-button]') as HTMLButtonElement;

    const cleanup = initBlogSearch({ root, entries, storage, now });
    input.value = '本文ワード';
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    input.value = '';
    input.focus();
    input.dispatchEvent(new Event('focus', { bubbles: true }));
    expect(history.classList.contains('hidden')).toBe(false);

    outsideButton.focus();
    root.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: outsideButton }));
    await Promise.resolve();

    expect(history.classList.contains('hidden')).toBe(true);
    cleanup();
  });

  it('loads the search index asynchronously and applies the initial query', async () => {
    const storage = createMemoryStorage();
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const button = document.querySelector('[data-blog-search-form] button') as HTMLButtonElement;
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-post-wrapper]'));
    root.dataset.initialQuery = '本文ワード';

    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => entries,
    }));

    const cleanup = await mountBlogSearch({ root, storage, fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith('/search-index.json', {
      headers: { Accept: 'application/json' },
    });
    expect(input.disabled).toBe(false);
    expect(button.disabled).toBe(false);
    expect(input.value).toBe('本文ワード');
    expect(wrappers[0]?.classList.contains('hidden')).toBe(false);
    expect(wrappers[1]?.classList.contains('hidden')).toBe(true);
    cleanup();
  });

  it('keeps the initial list visible and shows an error when the search index fetch fails', async () => {
    const storage = createMemoryStorage();
    const root = document.querySelector('[data-blog-search-root]') as HTMLElement;
    const input = document.querySelector('[data-blog-search-input]') as HTMLInputElement;
    const button = document.querySelector('[data-blog-search-form] button') as HTMLButtonElement;
    const error = document.querySelector('[data-blog-search-error]') as HTMLElement;
    const wrappers = Array.from(document.querySelectorAll<HTMLElement>('[data-post-wrapper]'));

    const cleanup = await mountBlogSearch({
      root,
      storage,
      fetchImpl: vi.fn(async () => {
        throw new Error('network error');
      }),
    });

    expect(error.classList.contains('hidden')).toBe(false);
    expect(input.disabled).toBe(true);
    expect(button.disabled).toBe(true);
    expect(wrappers.every((wrapper) => !wrapper.classList.contains('hidden'))).toBe(true);
    cleanup();
  });
});
