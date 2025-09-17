import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';

const CACHE_DURATION = 60 * 60 * 1000; // 1時間
const cache = new Map<string, { data: ExternalPost[]; timestamp: number }>();

interface ZennArticle {
  title: string;
  slug: string;
  created_at: string;
  published_at: string;
  emoji: string;
  topics: { name: string }[];
}

interface ZennResponse {
  articles: ZennArticle[];
}

function parseDate(dateStr: string): Date {
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

function generateCustomThumbnail(emoji: string): string {
  // Generate a neutral theme thumbnail with gradient background
  // Use a subtle gradient that works well with both light and dark themes
  const svg = `
    <svg width="300" height="157" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="157" fill="url(#bgGradient)"/>
      <text x="150" y="90" font-family="Arial, sans-serif" font-size="48" text-anchor="middle" fill="#495057">
        ${emoji}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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

    const data: ZennResponse = await response.json();

    const posts = await Promise.all(
      data.articles.map(async (article) => {
        const url = `https://zenn.dev/${targetUsername}/articles/${article.slug}`;
        let thumbnail: string;

        // Try to get OGP image first, fallback to custom emoji thumbnail
        try {
          const ogpImage = await getOGPImage(url);
          if (ogpImage && !ogpImage.includes('qiita.com')) {
            thumbnail = ogpImage;
          } else {
            // Generate custom thumbnail with emoji
            thumbnail = generateCustomThumbnail(article.emoji);
          }
        } catch {
          thumbnail = generateCustomThumbnail(article.emoji);
        }

        return {
          title: article.title,
          url,
          platform: 'Zenn',
          publishDate: parseDate(article.published_at || article.created_at),
          thumbnail,
          isExternal: true as const,
          tags: article.topics?.map((topic) => topic.name) || [],
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