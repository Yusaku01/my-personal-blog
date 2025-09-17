import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';

const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();

interface ZennPost {
  title: string;
  path: string;
  published_at: string;
  article_type: string;
  emoji?: string;
  slug: string;
}

function parseDate(dateStr: string): Date {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
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

    const posts = await Promise.all(
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
    console.error('Failed to fetch Zenn posts:', error);

    if (cachedData) {
      return cachedData.data;
    }

    return [];
  }
}
