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

function generateCustomThumbnail(emoji?: string): string {
  if (!emoji) {
    emoji = '📝'; // デフォルトの絵文字
  }
  
  // SVGベースのカスタムサムネイル生成
  const svgContent = `
    <svg width="300" height="157" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa"/>
          <stop offset="100%" style="stop-color:#e9ecef"/>
        </linearGradient>
      </defs>
      <rect width="300" height="157" fill="url(#bg)"/>
      <text x="150" y="90" font-family="system-ui" font-size="48" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svgContent)}`;
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
          // OGP画像が取得できない場合はカスタムサムネイルを生成
          thumbnail = undefined;
        }

        // OGP画像がない場合はカスタムサムネイルを使用
        if (!thumbnail) {
          thumbnail = generateCustomThumbnail(article.emoji);
        }

        return {
          title: article.title,
          url: fullUrl,
          platform: 'Zenn',
          publishDate: parseDate(article.published_at),
          thumbnail,
          isExternal: true as const,
          // article_typeをタグとして追加し、その他に必要なタグがあれば含める
          tags: [article.article_type].filter(Boolean),
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