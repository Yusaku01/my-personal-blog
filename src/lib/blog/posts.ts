import { getCollection } from 'astro:content';
import { getQiitaPosts } from '../api-clients/qiita';
import { getZennPosts, getZennScraps } from '../api-clients/zenn';
import type { SearchablePost } from '../../types/index';
import { buildBlogSearchText } from './search';
import { buildSearchIndexEntries, type SearchIndexEntry } from './searchIndex';
import { defaultLocale, localizedPath, type Locale } from '../i18n';

export async function getAllBlogPosts(locale: Locale = 'ja'): Promise<SearchablePost[]> {
  const posts = await getCollection('blog');
  const qiitaPosts = await getQiitaPosts('ngtnysk');
  const zennPosts = await getZennPosts('saku2323');
  const zennScraps = await getZennScraps('saku2323');

  const allPosts: SearchablePost[] = [
    ...posts.map((post) => ({
      title: post.data.title,
      url: localizedPath(`/blog/${post.id}`, locale === 'en' ? defaultLocale : locale),
      publishDate: post.data.publishDate,
      excerpt: post.data.description,
      thumbnail: post.data.image,
      isExternal: false as const,
      source: 'personal' as const,
      tags: post.data.tags || [],
      searchText: buildBlogSearchText({
        source: 'personal',
        title: post.data.title,
        tags: post.data.tags || [],
        excerpt: post.data.description,
        body: post.body,
      }),
    })),
    ...qiitaPosts.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
    ...zennPosts.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
    ...zennScraps.map((post) => ({
      ...post,
      searchText: buildBlogSearchText({
        source: post.source,
        title: post.title,
        tags: post.tags,
      }),
    })),
  ];

  return [...allPosts].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export async function getSearchIndexEntries(locale: Locale = 'ja'): Promise<SearchIndexEntry[]> {
  const posts = await getAllBlogPosts(locale);
  return buildSearchIndexEntries(posts);
}
