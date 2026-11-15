import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';
import { createCachedFeedLoader } from './feedCache';

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

const loadZennPosts = createCachedFeedLoader({
  label: 'Zenn posts',
  load: async (username) => {
    const baseUrl = process.env.ZENN_API_ENDPOINT || 'https://zenn.dev/api';
    const response = await fetch(`${baseUrl}/articles?username=${username}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Zenn posts');
    }

    const data = await response.json();
    const articles: ZennPost[] = data.articles || [];

    return Promise.all(
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
  },
});

const loadZennScraps = createCachedFeedLoader({
  label: 'Zenn scraps',
  load: async (username) => {
    const baseUrl = process.env.ZENN_API_ENDPOINT || 'https://zenn.dev/api';
    const response = await fetch(`${baseUrl}/scraps?username=${username}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Zenn scraps');
    }

    const data = await response.json();
    const scraps: ZennScrap[] = data.scraps || [];

    return scraps.map((scrap) => ({
      title: scrap.title,
      url: `https://zenn.dev${scrap.path}`,
      platform: 'Zenn Scrap',
      publishDate: parseDate(scrap.created_at),
      // Zenn Scrapは固定OGPを使用
      thumbnail: ZENN_SCRAP_THUMBNAIL,
      isExternal: true as const,
      source: 'zennScrap' as const,
      tags: ['scrap'],
    }));
  },
});

export async function getZennPosts(username?: string): Promise<ExternalPost[]> {
  return loadZennPosts(username || process.env.ZENN_USERNAME || 'saku2323');
}

export async function getZennScraps(username?: string): Promise<ExternalPost[]> {
  return loadZennScraps(username || process.env.ZENN_USERNAME || 'saku2323');
}
