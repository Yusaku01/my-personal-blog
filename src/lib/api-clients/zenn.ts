import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';

const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();

interface ZennArticle {
  id: number;
  title: string;
  slug: string;
  published_at: string;
  path: string;
  user: {
    username: string;
    name: string;
    avatar_small_url: string;
  };
  topics: Array<{
    name: string;
    display_name: string;
  }>;
  emoji: string;
  article_type: 'tech' | 'idea';
}

interface ZennResponse {
  articles: ZennArticle[];
  next_page: string | null;
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
  const targetUsername = username || process.env.ZENN_USERNAME;
  if (!targetUsername) {
    throw new Error('Zenn username is not provided');
  }

  const cacheKey = `zenn-posts-${targetUsername}`;
  const cachedData = cache.get(cacheKey);
  const now = Date.now();

  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const baseUrl = process.env.ZENN_API_ENDPOINT || 'https://zenn.dev/api';
    const response = await fetch(`${baseUrl}/articles?username=${targetUsername}&order=latest`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Zenn posts');
    }

    const data: ZennResponse = await response.json();

    const posts = await Promise.all(
      data.articles.map(async (article) => {
        const articleUrl = `https://zenn.dev${article.path}`;
        return {
          title: article.title,
          url: articleUrl,
          platform: 'Zenn',
          publishDate: parseDate(article.published_at),
          thumbnail: await getOGPImage(articleUrl),
          isExternal: true as const,
          tags: article.topics.map((topic) => topic.display_name),
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