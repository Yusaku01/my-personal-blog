import { type ExternalPost } from '../../types/index';
import { getOGPImage } from '../utils/ogp';
import { createCachedFeedLoader } from './feedCache';

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

const loadQiitaPosts = createCachedFeedLoader({
  label: 'Qiita posts',
  load: async (username) => {
    const baseUrl = process.env.QIITA_API_ENDPOINT || 'https://qiita.com/api/v2';
    const response = await fetch(`${baseUrl}/users/${username}/items?per_page=100`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Qiita posts');
    }

    const items: QiitaPost[] = await response.json();

    return Promise.all(
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
  },
});

export async function getQiitaPosts(username?: string): Promise<ExternalPost[]> {
  const targetUsername = username || process.env.QIITA_USERNAME;
  if (!targetUsername) {
    throw new Error('Qiita username is not provided');
  }

  return loadQiitaPosts(targetUsername);
}
