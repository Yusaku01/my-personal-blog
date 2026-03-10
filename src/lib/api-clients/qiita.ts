import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';

const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();
const warnedMessages = new Set<string>();

interface QiitaPost {
  title: string;
  url: string;
  created_at: string;
  tags: { name: string }[];
}

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

export async function getQiitaPosts(username?: string): Promise<ExternalPost[]> {
  const targetUsername = username || process.env.QIITA_USERNAME;
  if (!targetUsername) {
    throw new Error('Qiita username is not provided');
  }

  const cacheKey = `qiita-posts-${targetUsername}`;
  const cachedData = cache.get(cacheKey);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const baseUrl = process.env.QIITA_API_ENDPOINT || 'https://qiita.com/api/v2';
    const response = await fetch(`${baseUrl}/users/${targetUsername}/items?per_page=100`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Qiita posts');
    }

    const items: QiitaPost[] = await response.json();

    const posts: ExternalPost[] = await Promise.all(
      items.map(async (item) => ({
        title: item.title,
        url: item.url,
        platform: 'Qiita',
        publishDate: parseDate(item.created_at),
        thumbnail: await getOGPImage(item.url),
        isExternal: true as const,
        source: 'qiita' as const,
        tags: item.tags.map((tag) => tag.name),
      }))
    );

    cache.set(cacheKey, {
      data: posts,
      timestamp: now,
    });

    return posts;
  } catch (error) {
    warnOnce(
      `[blog] Failed to fetch Qiita posts (${summarizeFetchError(
        error
      )}). Using cached or empty results.`
    );

    if (cachedData) {
      return cachedData.data;
    }

    return [];
  }
}
