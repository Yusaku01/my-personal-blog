import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getOGPImage } from '../src/lib/utils/ogp';

vi.mock('../src/lib/utils/ogp', () => ({ getOGPImage: vi.fn() }));

const feedCases = [
  {
    name: 'Qiita posts',
    load: async () => (await import('../src/lib/api-clients/qiita')).getQiitaPosts,
    body: [
      {
        title: 'Example post',
        url: 'https://qiita.com/example/items/post',
        created_at: '2026-11-01T00:00:00Z',
        tags: [{ name: 'Astro' }],
      },
    ],
    url: 'https://qiita.com/api/v2/users/example/items?per_page=100',
    post: {
      url: 'https://qiita.com/example/items/post',
      platform: 'Qiita',
      source: 'qiita',
      tags: ['Astro'],
      thumbnail: 'https://example.com/ogp.png',
    },
  },
  {
    name: 'Zenn posts',
    load: async () => (await import('../src/lib/api-clients/zenn')).getZennPosts,
    body: {
      articles: [
        {
          title: 'Example post',
          path: '/example/articles/post',
          published_at: '2026-11-01T00:00:00Z',
          article_type: 'tech',
        },
      ],
    },
    url: 'https://zenn.dev/api/articles?username=example',
    post: {
      url: 'https://zenn.dev/example/articles/post',
      platform: 'Zenn',
      source: 'zenn',
      tags: ['tech'],
      thumbnail: 'https://example.com/ogp.png',
    },
  },
  {
    name: 'Zenn scraps',
    load: async () => (await import('../src/lib/api-clients/zenn')).getZennScraps,
    body: {
      scraps: [
        {
          title: 'Example post',
          path: '/example/scraps/post',
          created_at: '2026-11-01T00:00:00Z',
        },
      ],
    },
    url: 'https://zenn.dev/api/scraps?username=example',
    post: {
      url: 'https://zenn.dev/example/scraps/post',
      platform: 'Zenn Scrap',
      source: 'zennScrap',
      tags: ['scrap'],
      thumbnail: '/images/ogp/zenn-scrap.png',
    },
  },
];

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-15T00:00:00Z'));
  vi.stubEnv('QIITA_API_ENDPOINT', 'https://qiita.com/api/v2');
  vi.stubEnv('ZENN_API_ENDPOINT', 'https://zenn.dev/api');
  vi.mocked(getOGPImage).mockReset().mockResolvedValue('https://example.com/ogp.png');
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe.each(feedCases)('$name', (feed) => {
  it('preserves normalized metadata and caches a successful response for one hour', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(feed.body));
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();

    const posts = await load('example');
    expect(posts).toEqual([
      {
        ...feed.post,
        title: 'Example post',
        publishDate: new Date('2026-11-01T00:00:00Z'),
        isExternal: true,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(feed.url, {
      headers: { Accept: 'application/json' },
    });
    vi.advanceTimersByTime(60 * 60 * 1000 - 1);
    expect(await load('example')).toBe(posts);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValue(Response.json(feed.body));
    vi.advanceTimersByTime(1);
    await load('example');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shares concurrent requests for the same feed and username', async () => {
    let resolveResponse!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveResponse = resolve;
    });
    const fetchMock = vi.fn().mockImplementation(() => pending);
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();

    const first = load('example');
    const second = load('example');
    resolveResponse(Response.json(feed.body));
    const [firstPosts, secondPosts] = await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstPosts).toEqual([expect.objectContaining(feed.post)]);
    expect(secondPosts).toBe(firstPosts);
    expect(getOGPImage).toHaveBeenCalledTimes(feed.post.source === 'zennScrap' ? 0 : 1);
  });

  it('keeps different usernames isolated', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(Response.json(feed.body)));
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();

    await Promise.all([load('example'), load('another')]);
    await load('example');
    await load('another');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns stale posts on failure and retries the next request', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json(feed.body));
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();
    const posts = await load('example');
    vi.advanceTimersByTime(60 * 60 * 1000);

    fetchMock.mockRejectedValueOnce(new Error('offline', { cause: { code: 'ECONNRESET' } }));
    expect(await load('example')).toBe(posts);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('ECONNRESET'));

    fetchMock.mockResolvedValueOnce(Response.json(feed.body));
    expect(await load('example')).toEqual(posts);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('returns an empty fallback without caching failed initial requests and warns once', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();

    expect(await load('example')).toEqual([]);
    expect(await load('example')).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenCalledTimes(1);

    fetchMock.mockResolvedValueOnce(Response.json(feed.body));
    expect(await load('example')).toEqual([expect.objectContaining(feed.post)]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not cache an HTTP error as a successful response', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    const load = await feed.load();

    expect(await load('example')).toEqual([]);
    fetchMock.mockResolvedValueOnce(Response.json(feed.body));
    expect(await load('example')).toEqual([expect.objectContaining(feed.post)]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

it('keeps Zenn articles and scraps in separate caches for the same username', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(Response.json(feedCases[1].body))
    .mockResolvedValueOnce(Response.json(feedCases[2].body));
  vi.stubGlobal('fetch', fetchMock);
  const { getZennPosts, getZennScraps } = await import('../src/lib/api-clients/zenn');

  const [posts, scraps] = await Promise.all([getZennPosts('example'), getZennScraps('example')]);

  expect(posts[0].source).toBe('zenn');
  expect(scraps[0].source).toBe('zennScrap');
  expect(await getZennPosts('example')).toBe(posts);
  expect(await getZennScraps('example')).toBe(scraps);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});
