import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';

const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();
const warnedMessages = new Set<string>();

interface ZennPost {
  title: string;
  path: string;
  published_at: string;
  article_type: string;
  emoji?: string;
  slug: string;
}

interface ZennScrap {
  title: string;
  path: string;
  created_at: string;
  closed: boolean;
  comments_count: number;
}

const ZENN_SCRAP_THUMBNAIL = '/images/ogp/zenn-scrap.png';

function parseDate(dateStr: string): Date {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

function summarizeFetchError(error: unknown): string {
  if (error instanceof Error) {
    const cause = error.cause;
    if (
      typeof cause === 'object' &&
      cause !== null &&
      'code' in cause &&
      typeof cause.code === 'string'
    ) {
      return cause.code;
    }

    return error.message;
  }

  return 'unknown error';
}

function warnOnce(message: string) {
  if (warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  console.warn(message);
}

export async function getZennPosts(username?: string): Promise<ExternalPost[]> {
  const targetUsername = username || process.env.ZENN_USERNAME || 'saku2323';

  const cacheKey = `zenn-posts-${targetUsername}`;
  const cachedData = cache.get(cacheKey);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const baseUrl = process.env.ZENN_API_ENDPOINT || 'https://zenn.dev/api';
    const response = await fetch(`${baseUrl}/articles?username=${targetUsername}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Zenn posts');
    }

    const data = await response.json();
    const articles: ZennPost[] = data.articles || [];

    const posts: ExternalPost[] = await Promise.all(
      articles.map(async (article) => {
        const fullUrl = `https://zenn.dev${article.path}`;
        let thumbnail: string | undefined;

        try {
          // まずOGP画像を取得を試みる
          thumbnail = await getOGPImage(fullUrl);
        } catch {
          // OGP画像が取得できない場合はundefinedを代入
          thumbnail = undefined;
        }

        return {
          title: article.title,
          url: fullUrl,
          platform: 'Zenn',
          publishDate: parseDate(article.published_at),
          thumbnail,
          isExternal: true as const,
          source: 'zenn' as const,
          tags: article.article_type ? [article.article_type] : [],
        };
      })
    );

    cache.set(cacheKey, {
      data: posts,
      timestamp: now,
    });

    return posts;
  } catch (error) {
    warnOnce(
      `[blog] Failed to fetch Zenn posts (${summarizeFetchError(
        error
      )}). Using cached or empty results.`
    );

    if (cachedData) {
      return cachedData.data;
    }

    return [];
  }
}

export async function getZennScraps(username?: string): Promise<ExternalPost[]> {
  const targetUsername = username || process.env.ZENN_USERNAME || 'saku2323';

  const cacheKey = `zenn-scraps-${targetUsername}`;
  const cachedData = cache.get(cacheKey);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const baseUrl = process.env.ZENN_API_ENDPOINT || 'https://zenn.dev/api';
    const response = await fetch(`${baseUrl}/scraps?username=${targetUsername}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Zenn scraps');
    }

    const data = await response.json();
    const scraps: ZennScrap[] = data.scraps || [];

    const posts: ExternalPost[] = await Promise.all(
      scraps.map(async (scrap) => ({
        title: scrap.title,
        url: `https://zenn.dev${scrap.path}`,
        platform: 'Zenn Scrap',
        publishDate: parseDate(scrap.created_at),
        // Zenn Scrapは固定OGPを使用
        thumbnail: ZENN_SCRAP_THUMBNAIL,
        isExternal: true as const,
        source: 'zennScrap' as const,
        tags: ['scrap'],
      }))
    );

    cache.set(cacheKey, {
      data: posts,
      timestamp: now,
    });

    return posts;
  } catch (error) {
    warnOnce(
      `[blog] Failed to fetch Zenn scraps (${summarizeFetchError(
        error
      )}). Using cached or empty results.`
    );

    if (cachedData) {
      return cachedData.data;
    }

    return [];
  }
}
